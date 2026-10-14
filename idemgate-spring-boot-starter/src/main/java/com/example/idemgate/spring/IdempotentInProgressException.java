package com.example.idemgate.spring;

public class IdempotentInProgressException extends RuntimeException {

	public IdempotentInProgressException(String key) {
		super("Operation already in progress for key: " + key);
	}
}
