package com.example.idemgate.spring;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.idemgate.client.IdemgateClientException;
import com.example.idemgate.client.ResponseSnapshot;

@RestControllerAdvice
public class IdempotentExceptionHandler {

	@ExceptionHandler(IdempotentReplayException.class)
	public ResponseEntity<String> replay(IdempotentReplayException ex) {
		ResponseSnapshot snap = ex.getSnapshot();
		if (snap == null) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"code\":\"REPLAY_EMPTY\"}");
		}
		int status = snap.status() == null ? 200 : snap.status();
		return ResponseEntity.status(status)
				.contentType(MediaType.APPLICATION_JSON)
				.body(snap.body() == null ? "{}" : snap.body());
	}

	@ExceptionHandler(IdempotentInProgressException.class)
	public ResponseEntity<String> inProgress(IdempotentInProgressException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.contentType(MediaType.APPLICATION_JSON)
				.body("{\"code\":\"IN_PROGRESS\",\"message\":\"" + ex.getMessage() + "\"}");
	}

	@ExceptionHandler(IdemgateClientException.class)
	public ResponseEntity<String> client(IdemgateClientException ex) {
		int status = ex.getHttpStatus() > 0 ? ex.getHttpStatus() : 503;
		return ResponseEntity.status(status)
				.contentType(MediaType.APPLICATION_JSON)
				.body("{\"code\":\"" + ex.getCode() + "\",\"message\":\"" + ex.getMessage() + "\"}");
	}
}
