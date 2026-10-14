package com.example.idemgate.spring;

import com.example.idemgate.client.ResponseSnapshot;

public class IdempotentReplayException extends RuntimeException {

	private final ResponseSnapshot snapshot;

	public IdempotentReplayException(ResponseSnapshot snapshot) {
		super("Idempotent replay");
		this.snapshot = snapshot;
	}

	public ResponseSnapshot getSnapshot() {
		return snapshot;
	}
}
