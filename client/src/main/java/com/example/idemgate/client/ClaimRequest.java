package com.example.idemgate.client;

public record ClaimRequest(
		String scope,
		String key,
		String fingerprint,
		Integer ttlSeconds,
		String requestMethod,
		String requestPath,
		String businessKey
) {
	public static ClaimRequest of(String scope, String key, String fingerprint) {
		return new ClaimRequest(scope, key, fingerprint, null, null, null, null);
	}
}
