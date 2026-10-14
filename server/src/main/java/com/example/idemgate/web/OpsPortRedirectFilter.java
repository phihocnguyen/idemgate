package com.example.idemgate.web;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.idemgate.config.IdemgateProperties;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * On the API port, send browsers from {@code /ui} to the dedicated ops port (15672).
 * On the ops port, send {@code /} to {@code /ui/}.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class OpsPortRedirectFilter extends OncePerRequestFilter {

	private final int opsPort;
	private final int apiPort;

	public OpsPortRedirectFilter(IdemgateProperties properties, @Value("${server.port:8080}") int apiPort) {
		this.opsPort = properties.getOpsPort();
		this.apiPort = apiPort;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!"GET".equalsIgnoreCase(request.getMethod()) || opsPort <= 0) {
			filterChain.doFilter(request, response);
			return;
		}

		int local = request.getLocalPort();
		String context = request.getContextPath() == null ? "" : request.getContextPath();
		String relative = request.getRequestURI().substring(context.length());

		if (local == apiPort && (relative.equals("/ui") || relative.startsWith("/ui/"))) {
			String qs = request.getQueryString();
			String target = request.getScheme() + "://" + request.getServerName() + ":" + opsPort + relative
					+ (qs == null ? "" : "?" + qs);
			response.setStatus(HttpServletResponse.SC_FOUND);
			response.setHeader("Location", target);
			return;
		}

		if (local == opsPort && ("/".equals(relative) || relative.isEmpty())) {
			response.sendRedirect(context + "/ui/");
			return;
		}

		filterChain.doFilter(request, response);
	}
}
