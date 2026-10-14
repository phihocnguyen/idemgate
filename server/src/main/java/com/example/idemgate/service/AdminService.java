package com.example.idemgate.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.idemgate.api.dto.AdminOperationPage;
import com.example.idemgate.api.dto.AdminOperationView;
import com.example.idemgate.api.dto.AdminSettingsResponse;
import com.example.idemgate.api.dto.AdminSettingsUpdateRequest;
import com.example.idemgate.config.IdemgateProperties;
import com.example.idemgate.domain.Operation;
import com.example.idemgate.domain.OperationStatus;
import com.example.idemgate.persistence.OperationRepository;
import com.example.idemgate.persistence.OperationSearchQuery;

@Service
public class AdminService {

	private final OperationRepository repository;
	private final IdemgateProperties properties;

	public AdminService(OperationRepository repository, IdemgateProperties properties) {
		this.repository = repository;
		this.properties = properties;
	}

	@Transactional(readOnly = true)
	public AdminOperationPage search(OperationStatus status, String scope, String key, String businessKey, String q,
			UUID operationId, Instant from, Instant to, int limit, int offset) {
		int safeLimit = Math.min(Math.max(limit, 1), 200);
		int safeOffset = Math.max(offset, 0);
		OperationSearchQuery query = new OperationSearchQuery(status, scope, key, businessKey, q, operationId, from, to,
				safeLimit, safeOffset);
		List<AdminOperationView> items = repository.search(query).stream()
				.map(op -> AdminOperationView.from(op, false))
				.toList();
		long total = repository.countSearch(query);
		return new AdminOperationPage(items, total, safeLimit, safeOffset);
	}

	@Transactional(readOnly = true)
	public AdminOperationView get(UUID id) {
		Operation op = repository.findById(id)
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation not found", 404));
		return AdminOperationView.from(op, properties.isExposeResponseBody());
	}

	@Transactional(readOnly = true)
	public AdminSettingsResponse settings() {
		return new AdminSettingsResponse(
				properties.getRetentionDays(),
				properties.getDefaultTtlSeconds(),
				properties.getDefaultLeaseSeconds(),
				properties.getMaxResponseBodyBytes(),
				properties.isExposeResponseBody(),
				repository.listDistinctScopes());
	}

	public AdminSettingsResponse updateSettings(AdminSettingsUpdateRequest request) {
		if (request.retentionDays() != null) {
			properties.setRetentionDays(request.retentionDays());
		}
		if (request.defaultTtlSeconds() != null) {
			properties.setDefaultTtlSeconds(request.defaultTtlSeconds());
		}
		if (request.defaultLeaseSeconds() != null) {
			properties.setDefaultLeaseSeconds(request.defaultLeaseSeconds());
		}
		if (request.maxResponseBodyBytes() != null) {
			properties.setMaxResponseBodyBytes(request.maxResponseBodyBytes());
		}
		if (request.exposeResponseBody() != null) {
			properties.setExposeResponseBody(request.exposeResponseBody());
		}
		return settings();
	}
}
