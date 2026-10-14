package com.example.idemgate.domain;

public enum OperationStatus {
	IN_PROGRESS,
	COMPLETED,
	FAILED,
	UNKNOWN;

	public boolean isTerminal() {
		return this == COMPLETED || this == FAILED || this == UNKNOWN;
	}

	public static OperationStatus fromCompleteRequest(String value) {
		OperationStatus status = OperationStatus.valueOf(value);
		if (status == IN_PROGRESS) {
			throw new IllegalArgumentException("Cannot complete with IN_PROGRESS");
		}
		return status;
	}
}
