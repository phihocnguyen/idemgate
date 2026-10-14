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
}
