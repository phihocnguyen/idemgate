package com.example.idemgate.persistence;

import java.time.Instant;
import java.util.UUID;

import com.example.idemgate.domain.OperationStatus;

public record OperationSearchQuery(
		OperationStatus status,
		String scope,
		String key,
		String businessKey,
		String q,
		UUID operationId,
		Instant from,
		Instant to,
		int limit,
		int offset
) {
}
