package com.example.idemgate.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
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

/**
 * Auth for {@code /v1/**}:
 * <ul>
 * <li>Always: {@code X-Api-Key}</li>
 * <li>{@code /v1/admin/**} also: HTTP Basic with ops username/password (dashboard)</li>
 * </ul>
 */
public class ApiKeyAuthFilter extends OncePerRequestFilter {

	public static final String HEADER = "X-Api-Key";

	private final String expectedApiKey;
	private final String opsUsername;
	private final String opsPassword;

	public ApiKeyAuthFilter(String expectedApiKey, String opsUsername, String opsPassword) {
		this.expectedApiKey = expectedApiKey;
		this.opsUsername = opsUsername;
		this.opsPassword = opsPassword;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI();
		return !path.startsWith("/v1/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String path = request.getRequestURI();
		boolean admin = path.startsWith("/v1/admin");

		String provided = request.getHeader(HEADER);
		if (provided != null && constantTimeEquals(provided, expectedApiKey)) {
			authenticate("api-client", "ROLE_API");
			filterChain.doFilter(request, response);
			return;
		}

		if (admin && opsBasicOk(request)) {
			authenticate("ops-console", "ROLE_OPS");
			filterChain.doFilter(request, response);
			return;
		}

		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write("{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid or missing credentials\"}");
	}

	private boolean opsBasicOk(HttpServletRequest request) {
		String header = request.getHeader("Authorization");
		if (header == null || !header.regionMatches(true, 0, "Basic ", 0, 6)) {
			return false;
		}
		try {
			String decoded = new String(Base64.getDecoder().decode(header.substring(6).trim()), StandardCharsets.UTF_8);
			int colon = decoded.indexOf(':');
			if (colon < 0) {
				return false;
			}
			String user = decoded.substring(0, colon);
			String pass = decoded.substring(colon + 1);
			return constantTimeEquals(user, opsUsername) && constantTimeEquals(pass, opsPassword);
		}
		catch (IllegalArgumentException ex) {
			return false;
		}
	}

	private static void authenticate(String principal, String role) {
		var auth = new UsernamePasswordAuthenticationToken(principal, null,
				List.of(new SimpleGrantedAuthority(role)));
		SecurityContextHolder.getContext().setAuthentication(auth);
	}

	private static boolean constantTimeEquals(String a, String b) {
		if (a == null || b == null) {
			return false;
		}
		byte[] left = a.getBytes(StandardCharsets.UTF_8);
		byte[] right = b.getBytes(StandardCharsets.UTF_8);
		return MessageDigest.isEqual(left, right);
	}
}
