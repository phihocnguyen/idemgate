package com.example.idemgate.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record AdminSettingsUpdateRequest(
		@Min(1) @Max(3650) Integer retentionDays,
		@Min(1) @Max(86400) Integer defaultTtlSeconds,
		@Min(1) @Max(86400) Integer defaultLeaseSeconds,
		@Min(0) @Max(10_485_760) Integer maxResponseBodyBytes,
		Boolean exposeResponseBody
) {
}
