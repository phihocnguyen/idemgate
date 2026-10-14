package com.example.idemgate.config;

import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Ensures the parent directory exists for a file-backed SQLite JDBC URL.
 */
@Configuration
public class SqliteDataSourceConfig {

	public SqliteDataSourceConfig(DataSourceProperties properties) {
		ensureParentDirectory(properties.determineUrl());
	}

	static void ensureParentDirectory(String url) {
		if (url == null || !url.startsWith("jdbc:sqlite:")) {
			return;
		}
		String pathPart = url.substring("jdbc:sqlite:".length());
		if (pathPart.startsWith("file:")) {
			pathPart = pathPart.substring("file:".length());
		}
		int q = pathPart.indexOf('?');
		String query = q >= 0 ? pathPart.substring(q + 1) : "";
		if (q >= 0) {
			pathPart = pathPart.substring(0, q);
		}
		if (pathPart.isBlank() || pathPart.startsWith(":memory:") || query.contains("mode=memory")) {
			return;
		}
		try {
			Path parent = Path.of(pathPart).getParent();
			if (parent != null) {
				Files.createDirectories(parent);
			}
		}
		catch (Exception ignored) {
			// DataSource init will surface a clearer error if the path is unusable.
		}
	}
}
