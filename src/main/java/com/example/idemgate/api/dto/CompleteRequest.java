package com.example.idemgate.api.dto;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;

public record CompleteRequest(
		@NotBlank String status,
		Integer responseStatus,
		Map<String, String> responseHeaders,
		String responseBody
) {
}
