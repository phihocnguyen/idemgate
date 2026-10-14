package com.example.idemgate.web;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * SPA fallback for the embedded ops console under {@code /ui/**}.
 * Asset files (paths containing a '.') are left to the resource handler.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class OpsUiForwardFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!"GET".equalsIgnoreCase(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}

		String path = request.getRequestURI();
		String context = request.getContextPath() == null ? "" : request.getContextPath();
		String relative = path.startsWith(context) ? path.substring(context.length()) : path;

		if ("/".equals(relative) || relative.isEmpty()) {
			response.sendRedirect(context + "/ui/");
			return;
		}

		if ("/ui".equals(relative)) {
			response.sendRedirect(context + "/ui/");
			return;
		}

		if (relative.startsWith("/ui/") && !relative.equals("/ui/index.html") && !looksLikeAsset(relative)) {
			request.getRequestDispatcher("/ui/index.html").forward(request, response);
			return;
		}

		filterChain.doFilter(request, response);
	}

	private static boolean looksLikeAsset(String relative) {
		String name = relative.substring(relative.lastIndexOf('/') + 1);
		return name.contains(".");
	}
}
