package com.example.idemgate.spring;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "idemgate.client")
public class IdemgateClientProperties {

	private String baseUrl = "http://localhost:8080";
	private String apiKey = "dev-secret-change-me";
	private String defaultScope = "default";
	private int defaultTtlSeconds = 300;
	/** When true (default), IdemGate errors fail the request instead of running business logic. */
	private boolean failClosed = true;
	private String idempotencyKeyHeader = "Idempotency-Key";

	public String getBaseUrl() {
		return baseUrl;
	}

	public void setBaseUrl(String baseUrl) {
		this.baseUrl = baseUrl;
	}

	public String getApiKey() {
		return apiKey;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}

	public String getDefaultScope() {
		return defaultScope;
	}

	public void setDefaultScope(String defaultScope) {
		this.defaultScope = defaultScope;
	}

	public int getDefaultTtlSeconds() {
		return defaultTtlSeconds;
	}

	public void setDefaultTtlSeconds(int defaultTtlSeconds) {
		this.defaultTtlSeconds = defaultTtlSeconds;
	}

	public boolean isFailClosed() {
		return failClosed;
	}

	public void setFailClosed(boolean failClosed) {
		this.failClosed = failClosed;
	}

	public String getIdempotencyKeyHeader() {
		return idempotencyKeyHeader;
	}

	public void setIdempotencyKeyHeader(String idempotencyKeyHeader) {
		this.idempotencyKeyHeader = idempotencyKeyHeader;
	}
}
