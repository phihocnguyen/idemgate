package com.example.idemgate;

import java.io.IOException;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

/**
 * Shared embedded PostgreSQL for integration tests (no Docker required).
 */
public abstract class SupportPostgres {

	private static EmbeddedPostgres postgres;

	@BeforeAll
	static void startPostgres() throws IOException {
		if (postgres == null) {
			postgres = EmbeddedPostgres.builder().setPort(0).start();
		}
	}

	@AfterAll
	static void stopPostgres() throws IOException {
		// Keep process for the JVM lifetime so parallel Spring contexts can share it.
	}

	@DynamicPropertySource
	static void datasourceProps(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", () -> postgres.getJdbcUrl("postgres", "postgres"));
		registry.add("spring.datasource.username", () -> "postgres");
		registry.add("spring.datasource.password", () -> "postgres");
		registry.add("idemgate.api-key", () -> "test-api-key");
	}
}
