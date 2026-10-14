package com.example.idemgate.domain;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record Operation(
		UUID id,
		String scope,
		String idempotencyKey,
		String fingerprint,
		OperationStatus status,
		String requestMethod,
		String requestPath,
		Integer responseStatus,
		Map<String, String> responseHeaders,
		String responseBody,
		String ownerToken,
		Instant leaseExpiresAt,
		String businessKey,
		Instant expiresAt,
		Instant retainUntil,
		Instant createdAt,
		Instant updatedAt,
		Instant completedAt
) {
}
