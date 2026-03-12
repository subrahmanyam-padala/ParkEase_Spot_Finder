package com.parkeasy.ParkEase_backend.config;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException exception) {
		HttpStatus status = exception.getMessage() != null
				&& exception.getMessage().toLowerCase().contains("invalid admin credentials") ? HttpStatus.UNAUTHORIZED
						: HttpStatus.BAD_REQUEST;
		return buildErrorResponse(status, exception.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException exception) {
		String errors = exception.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage()).collect(Collectors.joining(", "));
		if (errors.isBlank()) {
			errors = "Validation failed";
		}
		return buildErrorResponse(HttpStatus.BAD_REQUEST, errors);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException exception) {
		return buildErrorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
	}

	@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
	public ResponseEntity<Map<String, Object>> handleOptimisticLock(ObjectOptimisticLockingFailureException exception) {
		return buildErrorResponse(HttpStatus.CONFLICT,
				"This spot was just booked by someone else. Please try a different spot.");
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGenericException(Exception exception) {
		return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
				"An unexpected error occurred: " + exception.getMessage());
	}

	private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", LocalDateTime.now().toString());
		body.put("status", status.value());
		body.put("error", status.getReasonPhrase());
		body.put("message", message);
		return ResponseEntity.status(status).body(body);
	}
}
