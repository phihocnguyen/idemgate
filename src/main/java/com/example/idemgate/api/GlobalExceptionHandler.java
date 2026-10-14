package com.example.idemgate.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.idemgate.api.dto.ErrorResponse;
import com.example.idemgate.service.IdempotencyException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(IdempotencyException.class)
	public ResponseEntity<ErrorResponse> handleIdempotency(IdempotencyException ex) {
		return ResponseEntity.status(ex.getHttpStatus())
				.body(new ErrorResponse(ex.getCode(), ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getFieldErrors().stream()
				.findFirst()
				.map(err -> err.getField() + ": " + err.getDefaultMessage())
				.orElse("Validation failed");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ErrorResponse("VALIDATION_ERROR", message));
	}
}
