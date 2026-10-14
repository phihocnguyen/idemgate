package com.example.idemgate.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "idemgate")
public class IdemgateProperties {

	private String apiKey = "dev-secret-change-me";
	private int defaultTtlSeconds = 300;
	/** Lease length for IN_PROGRESS ownership; reclaim only after lease expiry. */
	private int defaultLeaseSeconds = 60;
	private int retentionDays = 7;
	private int maxResponseBodyBytes = 65_536;
	private long cleanupIntervalMs = 60_000L;
	/** When false (default), admin APIs omit response body content. */
	private boolean exposeResponseBody = false;

	/** Ops console HTTP Basic username (dashboard only; claim API still uses api-key). */
	private String opsUsername = "admin";

	/** Ops console HTTP Basic password. */
	private String opsPassword = "admin";

	/**
	 * Dedicated ops/management HTTP port (RabbitMQ {@code 15672}-style). {@code 0} disables
	 * the extra connector; UI is then only on {@code server.port}.
	 */
	private int opsPort = 15672;

	public String getApiKey() {
		return apiKey;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}

	public int getDefaultTtlSeconds() {
		return defaultTtlSeconds;
	}

	public void setDefaultTtlSeconds(int defaultTtlSeconds) {
		this.defaultTtlSeconds = defaultTtlSeconds;
	}

	public int getDefaultLeaseSeconds() {
		return defaultLeaseSeconds;
	}

	public void setDefaultLeaseSeconds(int defaultLeaseSeconds) {
		this.defaultLeaseSeconds = defaultLeaseSeconds;
	}

	public int getRetentionDays() {
		return retentionDays;
	}

	public void setRetentionDays(int retentionDays) {
		this.retentionDays = retentionDays;
	}

	public int getMaxResponseBodyBytes() {
		return maxResponseBodyBytes;
	}

	public void setMaxResponseBodyBytes(int maxResponseBodyBytes) {
		this.maxResponseBodyBytes = maxResponseBodyBytes;
	}

	public long getCleanupIntervalMs() {
		return cleanupIntervalMs;
	}

	public void setCleanupIntervalMs(long cleanupIntervalMs) {
		this.cleanupIntervalMs = cleanupIntervalMs;
	}

	public boolean isExposeResponseBody() {
		return exposeResponseBody;
	}

	public void setExposeResponseBody(boolean exposeResponseBody) {
		this.exposeResponseBody = exposeResponseBody;
	}

	public String getOpsUsername() {
		return opsUsername;
	}

	public void setOpsUsername(String opsUsername) {
		this.opsUsername = opsUsername;
	}

	public String getOpsPassword() {
		return opsPassword;
	}

	public void setOpsPassword(String opsPassword) {
		this.opsPassword = opsPassword;
	}

	public int getOpsPort() {
		return opsPort;
	}

	public void setOpsPort(int opsPort) {
		this.opsPort = opsPort;
	}
}
