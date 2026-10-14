package com.example.idemgate.service;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.idemgate.config.IdemgateProperties;
import com.example.idemgate.domain.Operation;
import com.example.idemgate.domain.OperationStatus;
import com.example.idemgate.persistence.OperationRepository;

@Service
public class IdempotencyService {

	private static final Pattern FINGERPRINT = Pattern.compile("^[a-fA-F0-9]{64}$");

	private final OperationRepository repository;
	private final IdemgateProperties properties;
	private final Clock clock;

	public IdempotencyService(OperationRepository repository, IdemgateProperties properties, Clock clock) {
		this.repository = repository;
		this.properties = properties;
		this.clock = clock;
	}

	@Transactional
	public ClaimResult claim(String scope, String key, String fingerprint, Integer ttlSeconds, String requestMethod,
			String requestPath, String businessKey) {
		validateFingerprint(fingerprint);
		Instant now = clock.instant();
		int ttl = ttlSeconds != null ? ttlSeconds : properties.getDefaultTtlSeconds();
		if (ttl <= 0) {
			throw new IdempotencyException("VALIDATION_ERROR", "ttlSeconds must be positive", 400);
		}
		int leaseSeconds = properties.getDefaultLeaseSeconds();
		Instant expiresAt = now.plusSeconds(ttl);
		Instant leaseExpiresAt = now.plusSeconds(leaseSeconds);
		Instant retainUntil = now.plus(properties.getRetentionDays(), ChronoUnit.DAYS);
		String ownerToken = UUID.randomUUID().toString().replace("-", "");
		UUID id = UUID.randomUUID();
		String fp = fingerprint.toLowerCase();

		if (businessKey != null && !businessKey.isBlank()) {
			Optional<Operation> byBusiness = repository.findByScopeAndBusinessKey(scope, businessKey);
			if (byBusiness.isPresent() && !byBusiness.get().idempotencyKey().equals(key)) {
				throw new IdempotencyException("BUSINESS_KEY_CONFLICT",
						"businessKey already bound to a different idempotency key", 409);
			}
		}

		Operation candidate = new Operation(id, scope, key, fp, OperationStatus.IN_PROGRESS, requestMethod, requestPath,
				null, Map.of(), null, ownerToken, leaseExpiresAt, blankToNull(businessKey), expiresAt, retainUntil, now,
				now, null);

		try {
			if (repository.insert(candidate)) {
				return new ClaimResult(true, candidate);
			}
		}
		catch (DataIntegrityViolationException ex) {
			throw new IdempotencyException("BUSINESS_KEY_CONFLICT",
					"businessKey already bound to a different idempotency key", 409);
		}

		Operation existing = repository.findByScopeAndKeyForUpdate(scope, key)
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation disappeared during claim race", 404));

		if (!existing.fingerprint().equalsIgnoreCase(fingerprint)) {
			throw new IdempotencyException("PAYLOAD_MISMATCH",
					"Idempotency key exists with a different request fingerprint", 409);
		}

		boolean leaseExpired = existing.status() == OperationStatus.IN_PROGRESS
				&& existing.leaseExpiresAt() != null
				&& existing.leaseExpiresAt().isBefore(now);

		if (leaseExpired) {
			String newToken = UUID.randomUUID().toString().replace("-", "");
			Instant newLease = now.plusSeconds(leaseSeconds);
			Instant newExpires = now.plusSeconds(ttl);
			Instant newRetain = now.plus(properties.getRetentionDays(), ChronoUnit.DAYS);
			boolean reclaimed = repository.reclaimExpiredLease(existing.id(), fp, newToken, newLease, newExpires,
					newRetain, now);
			if (reclaimed) {
				return new ClaimResult(true, repository.findById(existing.id()).orElse(existing));
			}
			existing = repository.findById(existing.id()).orElse(existing);
		}

		return new ClaimResult(false, existing);
	}

	@Transactional
	public Operation complete(UUID operationId, OperationStatus status, Integer responseStatus,
			Map<String, String> responseHeaders, String responseBody, String ownerToken) {
		if (!status.isTerminal()) {
			throw new IdempotencyException("VALIDATION_ERROR", "Complete status must be terminal", 400);
		}
		validateResponseBody(responseBody);
		Instant now = clock.instant();
		Operation existing = repository.findById(operationId)
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation not found", 404));

		if (existing.status().isTerminal()) {
			throw new IdempotencyException("INVALID_STATE", "Operation is already " + existing.status(), 409);
		}
		if (ownerToken == null || !ownerToken.equals(existing.ownerToken())) {
			throw new IdempotencyException("OWNERSHIP_MISMATCH", "ownerToken does not match claim owner", 409);
		}

		Instant retainUntil = now.plus(properties.getRetentionDays(), ChronoUnit.DAYS);
		boolean updated = repository.complete(operationId, ownerToken, status, responseStatus, responseHeaders,
				responseBody, retainUntil, now);
		if (!updated) {
			throw new IdempotencyException("INVALID_STATE", "Operation could not be completed", 409);
		}
		return repository.findById(operationId)
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation not found after complete", 404));
	}

	@Transactional
	public Operation heartbeat(UUID operationId, String ownerToken) {
		Instant now = clock.instant();
		Operation existing = repository.findById(operationId)
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation not found", 404));
		if (existing.status() != OperationStatus.IN_PROGRESS) {
			throw new IdempotencyException("INVALID_STATE", "Heartbeat only valid for IN_PROGRESS", 409);
		}
		if (ownerToken == null || !ownerToken.equals(existing.ownerToken())) {
			throw new IdempotencyException("OWNERSHIP_MISMATCH", "ownerToken does not match claim owner", 409);
		}
		Instant newLease = now.plusSeconds(properties.getDefaultLeaseSeconds());
		if (!repository.heartbeat(operationId, ownerToken, newLease, now)) {
			throw new IdempotencyException("INVALID_STATE", "Heartbeat failed", 409);
		}
		return repository.findById(operationId).orElse(existing);
	}

	@Transactional(readOnly = true)
	public Optional<Operation> getById(UUID id) {
		return repository.findById(id);
	}

	@Transactional(readOnly = true)
	public Optional<Operation> getByScopeAndKey(String scope, String key) {
		return repository.findByScopeAndKey(scope, key);
	}

	@Transactional(readOnly = true)
	public List<Operation> listUnknown(int limit) {
		return repository.listByStatus(OperationStatus.UNKNOWN, Math.min(Math.max(limit, 1), 200));
	}

	@Transactional
	public int cleanupExpired() {
		return repository.deleteExpired(clock.instant());
	}

	private void validateFingerprint(String fingerprint) {
		if (fingerprint == null || !FINGERPRINT.matcher(fingerprint).matches()) {
			throw new IdempotencyException("VALIDATION_ERROR", "fingerprint must be a 64-char hex SHA-256 digest", 400);
		}
	}

	private void validateResponseBody(String responseBody) {
		if (responseBody == null) {
			return;
		}
		int bytes = responseBody.getBytes(StandardCharsets.UTF_8).length;
		if (bytes > properties.getMaxResponseBodyBytes()) {
			throw new IdempotencyException("RESPONSE_TOO_LARGE",
					"responseBody exceeds max of " + properties.getMaxResponseBodyBytes() + " bytes", 413);
		}
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value;
	}
}
