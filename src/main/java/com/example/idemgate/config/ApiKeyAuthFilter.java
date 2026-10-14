package com.example.idemgate.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class ApiKeyAuthFilter extends OncePerRequestFilter {

	public static final String HEADER = "X-Api-Key";

	private final String expectedApiKey;

	public ApiKeyAuthFilter(String expectedApiKey) {
		this.expectedApiKey = expectedApiKey;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI();
		return !path.startsWith("/v1/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String provided = request.getHeader(HEADER);
		if (provided == null || !constantTimeEquals(provided, expectedApiKey)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.getWriter().write("{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid or missing X-Api-Key\"}");
			return;
		}
		var auth = new UsernamePasswordAuthenticationToken("api-client", null,
				List.of(new SimpleGrantedAuthority("ROLE_API")));
		SecurityContextHolder.getContext().setAuthentication(auth);
		filterChain.doFilter(request, response);
	}

	private static boolean constantTimeEquals(String a, String b) {
		byte[] left = a.getBytes(StandardCharsets.UTF_8);
		byte[] right = b.getBytes(StandardCharsets.UTF_8);
		return MessageDigest.isEqual(left, right);
	}
}
