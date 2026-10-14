package com.example.idemgate.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.idemgate.config.IdemgateProperties;
import com.example.idemgate.domain.Operation;
import com.example.idemgate.domain.OperationStatus;
import com.example.idemgate.persistence.OperationRepository;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

	private static final String FP = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	private static final Instant NOW = Instant.parse("2026-10-14T12:00:00Z");

	@Mock
	private OperationRepository repository;

	private IdempotencyService service;

	@BeforeEach
	void setUp() {
		IdemgateProperties props = new IdemgateProperties();
		props.setDefaultTtlSeconds(300);
		props.setDefaultLeaseSeconds(60);
		props.setRetentionDays(7);
		props.setMaxResponseBodyBytes(64);
		service = new IdempotencyService(repository, props, Clock.fixed(NOW, ZoneOffset.UTC));
	}

	@Test
	void claimInsertsWhenKeyIsNew() {
		when(repository.insert(any())).thenReturn(true);
		ClaimResult result = service.claim("payments", "k1", FP, null, "POST", "/pay", null);
		assertThat(result.claimed()).isTrue();
		assertThat(result.operation().ownerToken()).isNotBlank();
	}

	@Test
	void claimRejectsFingerprintMismatch() {
		UUID id = UUID.randomUUID();
		Operation existing = inProgress(id, "otherfingerprint0000000000000000000000000000000000000000000000", "tok");
		when(repository.insert(any())).thenReturn(false);
		when(repository.findByScopeAndKeyForUpdate("payments", "k1")).thenReturn(Optional.of(existing));
		assertThatThrownBy(() -> service.claim("payments", "k1", FP, null, null, null, null))
				.isInstanceOf(IdempotencyException.class)
				.extracting(ex -> ((IdempotencyException) ex).getCode())
				.isEqualTo("PAYLOAD_MISMATCH");
	}

	@Test
	void reclaimExpiredLease() {
		UUID id = UUID.randomUUID();
		Operation expired = new Operation(id, "payments", "k1", FP, OperationStatus.IN_PROGRESS, null, null, null,
				Map.of(), null, "old", NOW.minusSeconds(10), null, NOW.plusSeconds(100), NOW.plusSeconds(1000),
				NOW.minusSeconds(100), NOW.minusSeconds(100), null);
		when(repository.insert(any())).thenReturn(false);
		when(repository.findByScopeAndKeyForUpdate("payments", "k1")).thenReturn(Optional.of(expired));
		when(repository.reclaimExpiredLease(eq(id), eq(FP), any(), any(), any(), any(), eq(NOW))).thenReturn(true);
		when(repository.findById(id)).thenReturn(Optional.of(inProgress(id, FP, "newtok")));

		ClaimResult result = service.claim("payments", "k1", FP, 60, null, null, null);
		assertThat(result.claimed()).isTrue();
		verify(repository).reclaimExpiredLease(eq(id), eq(FP), any(), any(), any(), any(), eq(NOW));
	}

	@Test
	void completeRequiresOwnerToken() {
		UUID id = UUID.randomUUID();
		Operation existing = inProgress(id, FP, "owner");
		when(repository.findById(id)).thenReturn(Optional.of(existing));
		assertThatThrownBy(() -> service.complete(id, OperationStatus.COMPLETED, 200, Map.of(), "{}", "wrong"))
				.isInstanceOf(IdempotencyException.class)
				.extracting(ex -> ((IdempotencyException) ex).getCode())
				.isEqualTo("OWNERSHIP_MISMATCH");
	}

	@Test
	void completeSucceedsWithOwnerToken() {
		UUID id = UUID.randomUUID();
		Operation existing = inProgress(id, FP, "owner");
		Operation done = new Operation(id, "payments", "k1", FP, OperationStatus.COMPLETED, null, null, 201, Map.of(),
				"{\"ok\":true}", "owner", existing.leaseExpiresAt(), null, existing.expiresAt(), existing.retainUntil(),
				existing.createdAt(), NOW, NOW);
		when(repository.findById(id)).thenReturn(Optional.of(existing), Optional.of(done));
		when(repository.complete(eq(id), eq("owner"), eq(OperationStatus.COMPLETED), eq(201), any(), eq("{\"ok\":true}"),
				any(), eq(NOW))).thenReturn(true);

		Operation result = service.complete(id, OperationStatus.COMPLETED, 201, Map.of(), "{\"ok\":true}", "owner");
		assertThat(result.status()).isEqualTo(OperationStatus.COMPLETED);
	}

	private static Operation inProgress(UUID id, String fingerprint, String token) {
		return new Operation(id, "payments", "k1", fingerprint, OperationStatus.IN_PROGRESS, "POST", "/pay", null,
				Map.of(), null, token, NOW.plusSeconds(60), null, NOW.plusSeconds(300), NOW.plusSeconds(86400), NOW, NOW,
				null);
	}
}
