package com.example.idemgate.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.idemgate.api.dto.ClaimRequest;
import com.example.idemgate.api.dto.CompleteRequest;
import com.example.idemgate.api.dto.HeartbeatRequest;
import com.example.idemgate.api.dto.OperationResponse;
import com.example.idemgate.domain.OperationStatus;
import com.example.idemgate.service.ClaimResult;
import com.example.idemgate.service.IdempotencyException;
import com.example.idemgate.service.IdempotencyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/v1/operations")
@Validated
public class OperationController {

	private final IdempotencyService service;

	public OperationController(IdempotencyService service) {
		this.service = service;
	}

	@PostMapping("/claim")
	public OperationResponse claim(@Valid @RequestBody ClaimRequest request) {
		ClaimResult result = service.claim(request.scope(), request.key(), request.fingerprint(), request.ttlSeconds(),
				request.requestMethod(), request.requestPath(), request.businessKey());
		return OperationResponse.fromClaim(result);
	}

	@PostMapping("/{operationId}/complete")
	public OperationResponse complete(@PathVariable UUID operationId, @Valid @RequestBody CompleteRequest request) {
		OperationStatus status;
		try {
			status = OperationStatus.fromCompleteRequest(request.status());
		}
		catch (IllegalArgumentException ex) {
			throw new IdempotencyException("VALIDATION_ERROR", "status must be COMPLETED, FAILED, or UNKNOWN", 400);
		}
		return OperationResponse.from(service.complete(operationId, status, request.responseStatus(),
				request.responseHeaders(), request.responseBody(), request.ownerToken()));
	}

	@PostMapping("/{operationId}/heartbeat")
	public OperationResponse heartbeat(@PathVariable UUID operationId, @Valid @RequestBody HeartbeatRequest request) {
		return OperationResponse.from(service.heartbeat(operationId, request.ownerToken()), null, true);
	}

	@GetMapping("/{operationId}")
	public ResponseEntity<OperationResponse> getById(@PathVariable UUID operationId) {
		return service.getById(operationId)
				.map(op -> ResponseEntity.ok(OperationResponse.from(op)))
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation not found", 404));
	}

	@GetMapping
	public ResponseEntity<?> getByScopeAndKeyOrList(
			@RequestParam(required = false) String scope,
			@RequestParam(required = false) String key,
			@RequestParam(required = false) String status,
			@RequestParam(defaultValue = "50") int limit) {
		if (status != null && "UNKNOWN".equalsIgnoreCase(status)) {
			List<OperationResponse> list = service.listUnknown(limit).stream().map(OperationResponse::from).toList();
			return ResponseEntity.ok(list);
		}
		if (scope == null || key == null) {
			throw new IdempotencyException("VALIDATION_ERROR", "scope and key are required unless status=UNKNOWN", 400);
		}
		return service.getByScopeAndKey(scope, key)
				.map(op -> ResponseEntity.ok(OperationResponse.from(op)))
				.orElseThrow(() -> new IdempotencyException("NOT_FOUND", "Operation not found", 404));
	}
}
