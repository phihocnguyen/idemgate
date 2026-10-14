package com.example.idemgate.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Shared file-backed SQLite for integration tests (no Docker required).
 */
public abstract class SqliteTestConfig {

	private static final Path DB_FILE = createDbFile();

	private static Path createDbFile() {
		try {
			Path dir = Files.createTempDirectory("idemgate-it-");
			return dir.resolve("idemgate.db");
		}
		catch (IOException e) {
			throw new ExceptionInInitializerError(e);
		}
	}

	@DynamicPropertySource
	static void datasourceProps(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> "jdbc:sqlite:" + DB_FILE.toAbsolutePath());
		registry.add("spring.datasource.driver-class-name", () -> "org.sqlite.JDBC");
		registry.add("spring.datasource.hikari.maximum-pool-size", () -> "1");
		registry.add("spring.datasource.hikari.connection-init-sql", () -> "PRAGMA busy_timeout = 5000");
		registry.add("idemgate.api-key", () -> "test-api-key");
	}
}
