package com.example.idemgate.client;

import java.time.Instant;
import java.util.UUID;

public record OperationView(
		UUID operationId,
		Boolean claimed,
		OperationStatus status,
		String scope,
		String key,
		String fingerprint,
		String ownerToken,
		Instant expiresAt,
		ResponseSnapshot response
) {
}
