package com.example.idemgate.client;

import java.util.Map;

public record CompleteRequest(
		OperationStatus status,
		Integer responseStatus,
		Map<String, String> responseHeaders,
		String responseBody,
		String ownerToken
) {
	public static CompleteRequest completed(int httpStatus, String body, String ownerToken) {
		return new CompleteRequest(OperationStatus.COMPLETED, httpStatus,
				Map.of("Content-Type", "application/json"), body, ownerToken);
	}

	public static CompleteRequest failed(int httpStatus, String body, String ownerToken) {
		return new CompleteRequest(OperationStatus.FAILED, httpStatus,
				Map.of("Content-Type", "application/json"), body, ownerToken);
	}

	public static CompleteRequest unknown(String reason, String ownerToken) {
		return new CompleteRequest(OperationStatus.UNKNOWN, 500,
				Map.of("Content-Type", "application/json"),
				"{\"reason\":\"" + reason + "\"}", ownerToken);
	}
}
