package com.example.idemgate.service;

public class IdempotencyException extends RuntimeException {

	private final String code;
	private final int httpStatus;

	public IdempotencyException(String code, String message, int httpStatus) {
		super(message);
		this.code = code;
		this.httpStatus = httpStatus;
	}

	public String getCode() {
		return code;
	}

	public int getHttpStatus() {
		return httpStatus;
	}
}
