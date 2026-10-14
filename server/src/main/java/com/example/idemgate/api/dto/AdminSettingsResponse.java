package com.example.idemgate.api.dto;

import java.util.List;

public record AdminSettingsResponse(
		int retentionDays,
		int defaultTtlSeconds,
		int defaultLeaseSeconds,
		int maxResponseBodyBytes,
		boolean exposeResponseBody,
		List<String> scopes
) {
}
