package com.example.idemgate.api.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.example.idemgate.domain.Operation;
import com.example.idemgate.service.ClaimResult;

public record OperationResponse(
		UUID operationId,
		Boolean claimed,
		String status,
		String scope,
		String key,
		String fingerprint,
		String ownerToken,
		String businessKey,
		Instant leaseExpiresAt,
		Instant expiresAt,
		Instant retainUntil,
		Instant createdAt,
		Instant updatedAt,
		Instant completedAt,
		ResponseSnapshot response
) {

	public record ResponseSnapshot(Integer status, Map<String, String> headers, String body) {
	}

	public static OperationResponse fromClaim(ClaimResult result) {
		return from(result.operation(), result.claimed(), Boolean.TRUE.equals(result.claimed()));
	}

	public static OperationResponse from(Operation op) {
		return from(op, null, false);
	}

	public static OperationResponse from(Operation op, Boolean claimed, boolean includeOwnerToken) {
		ResponseSnapshot snapshot = null;
		if (op.status().isTerminal() && (op.responseStatus() != null || op.responseBody() != null)) {
			snapshot = new ResponseSnapshot(op.responseStatus(), op.responseHeaders(), op.responseBody());
		}
		return new OperationResponse(
				op.id(),
				claimed,
				op.status().name(),
				op.scope(),
				op.idempotencyKey(),
				op.fingerprint(),
				includeOwnerToken ? op.ownerToken() : null,
				op.businessKey(),
				op.leaseExpiresAt(),
				op.expiresAt(),
				op.retainUntil(),
				op.createdAt(),
				op.updatedAt(),
				op.completedAt(),
				snapshot);
	}
}
