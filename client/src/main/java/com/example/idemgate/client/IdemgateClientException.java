package com.example.idemgate.client;

public class IdemgateClientException extends RuntimeException {

	private final int httpStatus;
	private final String code;

	public IdemgateClientException(int httpStatus, String code, String message) {
		super(message);
		this.httpStatus = httpStatus;
		this.code = code;
	}

	public int getHttpStatus() {
		return httpStatus;
	}

	public String getCode() {
		return code;
	}

	public boolean isNetworkError() {
		return httpStatus == 0 || "NETWORK_ERROR".equals(code);
	}
}
