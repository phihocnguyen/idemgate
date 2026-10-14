package com.example.idemgate.client;

public enum OperationStatus {
	IN_PROGRESS,
	COMPLETED,
	FAILED,
	UNKNOWN;

	public boolean isTerminal() {
		return this == COMPLETED || this == FAILED || this == UNKNOWN;
	}
}
