package com.example.idemgate.api;

import java.time.Instant;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.idemgate.api.dto.AdminOperationPage;
import com.example.idemgate.api.dto.AdminOperationView;
import com.example.idemgate.api.dto.AdminSettingsResponse;
import com.example.idemgate.api.dto.AdminSettingsUpdateRequest;
import com.example.idemgate.domain.OperationStatus;
import com.example.idemgate.service.AdminService;
import com.example.idemgate.service.IdempotencyException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/v1/admin")
@Validated
public class AdminController {

	private final AdminService adminService;

	public AdminController(AdminService adminService) {
		this.adminService = adminService;
	}

	@GetMapping("/operations")
	public AdminOperationPage list(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String scope,
			@RequestParam(required = false) String key,
			@RequestParam(required = false) String businessKey,
			@RequestParam(required = false) String q,
			@RequestParam(required = false) UUID operationId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
			@RequestParam(defaultValue = "50") int limit,
			@RequestParam(defaultValue = "0") int offset) {
		OperationStatus parsed = null;
		if (status != null && !status.isBlank()) {
			try {
				parsed = OperationStatus.valueOf(status.toUpperCase());
			}
			catch (IllegalArgumentException ex) {
				throw new IdempotencyException("VALIDATION_ERROR", "Invalid status filter", 400);
			}
		}
		return adminService.search(parsed, scope, key, businessKey, q, operationId, from, to, limit, offset);
	}

	@GetMapping("/operations/{operationId}")
	public AdminOperationView get(@PathVariable UUID operationId) {
		return adminService.get(operationId);
	}

	@GetMapping("/settings")
	public AdminSettingsResponse settings() {
		return adminService.settings();
	}

	@PatchMapping("/settings")
	public AdminSettingsResponse updateSettings(@Valid @RequestBody AdminSettingsUpdateRequest request) {
		return adminService.updateSettings(request);
	}
}
