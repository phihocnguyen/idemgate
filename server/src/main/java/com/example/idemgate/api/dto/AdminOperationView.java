package com.example.idemgate.api.dto;

import java.time.Instant;
import java.util.UUID;

import com.example.idemgate.domain.Operation;

public record AdminOperationView(
		UUID operationId,
		String status,
		String scope,
		String key,
		String fingerprint,
		String businessKey,
		String requestMethod,
		String requestPath,
		Instant leaseExpiresAt,
		Instant expiresAt,
		Instant retainUntil,
		Instant createdAt,
		Instant updatedAt,
		Instant completedAt,
		Integer responseStatus,
		boolean responseBodyPresent,
		String responseBody
) {

	public static AdminOperationView from(Operation op, boolean includeBody) {
		boolean hasBody = op.responseBody() != null && !op.responseBody().isBlank();
		return new AdminOperationView(
				op.id(),
				op.status().name(),
				op.scope(),
				op.idempotencyKey(),
				op.fingerprint(),
				op.businessKey(),
				op.requestMethod(),
				op.requestPath(),
				op.leaseExpiresAt(),
				op.expiresAt(),
				op.retainUntil(),
				op.createdAt(),
				op.updatedAt(),
				op.completedAt(),
				op.responseStatus(),
				hasBody,
				includeBody && hasBody ? op.responseBody() : null);
	}
}
