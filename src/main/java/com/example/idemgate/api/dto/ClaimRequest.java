package com.example.idemgate.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ClaimRequest(
		@NotBlank @Size(max = 128) String scope,
		@NotBlank @Size(max = 256) String key,
		@NotBlank @Size(min = 64, max = 64) String fingerprint,
		@Positive Integer ttlSeconds,
		@Size(max = 16) String requestMethod,
		@Size(max = 512) String requestPath
) {
}
