package com.example.idemgate.spring;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.example.idemgate.client.ClaimRequest;
import com.example.idemgate.client.CompleteRequest;
import com.example.idemgate.client.Fingerprints;
import com.example.idemgate.client.IdemgateClient;
import com.example.idemgate.client.IdemgateClientException;
import com.example.idemgate.client.OperationStatus;
import com.example.idemgate.client.OperationView;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.databind.ObjectMapper;

@Aspect
public class IdempotentAspect {

	private final IdemgateClient client;
	private final IdemgateClientProperties properties;
	private final ObjectMapper objectMapper;
	private final SpelExpressionParser parser = new SpelExpressionParser();
	private final DefaultParameterNameDiscoverer names = new DefaultParameterNameDiscoverer();

	public IdempotentAspect(IdemgateClient client, IdemgateClientProperties properties, ObjectMapper objectMapper) {
		this.client = client;
		this.properties = properties;
		this.objectMapper = objectMapper;
	}

	@Around("@annotation(idempotent)")
	public Object around(ProceedingJoinPoint pjp, Idempotent idempotent) throws Throwable {
		HttpServletRequest request = currentRequest();
		if (request == null) {
			return pjp.proceed();
		}

		String key = request.getHeader(properties.getIdempotencyKeyHeader());
		if (key == null || key.isBlank()) {
			throw new IllegalArgumentException("Missing " + properties.getIdempotencyKeyHeader() + " header");
		}

		String scope = idempotent.scope().isBlank() ? properties.getDefaultScope() : idempotent.scope();
		int ttl = idempotent.ttlSeconds() > 0 ? idempotent.ttlSeconds() : properties.getDefaultTtlSeconds();
		String method = request.getMethod();
		String path = request.getRequestURI();
		byte[] bodyBytes = objectMapper.writeValueAsBytes(payloadArgs(pjp.getArgs()));
		String fingerprint = Fingerprints.sha256Hex(method, path, bodyBytes);
		String businessKey = resolveBusinessKey(idempotent.businessKey(), pjp);

		OperationView claim;
		try {
			claim = client.claim(new ClaimRequest(scope, key, fingerprint, ttl, method, path, businessKey));
		}
		catch (IdemgateClientException ex) {
			if (properties.isFailClosed()) {
				throw ex;
			}
			return pjp.proceed();
		}

		if (!Boolean.TRUE.equals(claim.claimed())) {
			if (claim.status() != null && claim.status().isTerminal() && claim.status() != OperationStatus.UNKNOWN) {
				throw new IdempotentReplayException(claim.response());
			}
			if (claim.status() == OperationStatus.IN_PROGRESS) {
				throw new IdempotentInProgressException(key);
			}
			if (claim.status() == OperationStatus.UNKNOWN) {
				throw new IdemgateClientException(409, "UNKNOWN", "Operation is UNKNOWN; reconcile before retry");
			}
		}

		MethodSignature signature = (MethodSignature) pjp.getSignature();
		if (CompletableFuture.class.isAssignableFrom(signature.getReturnType())) {
			@SuppressWarnings("unchecked")
			CompletableFuture<Object> future = (CompletableFuture<Object>) pjp.proceed();
			return future.handle((result, error) -> {
				completeQuietly(claim, result, error);
				if (error != null) {
					if (error instanceof RuntimeException re) {
						throw re;
					}
					throw new RuntimeException(error);
				}
				return result;
			});
		}

		try {
			Object result = pjp.proceed();
			completeQuietly(claim, result, null);
			return result;
		}
		catch (Throwable error) {
			completeQuietly(claim, null, error);
			throw error;
		}
	}

	private static Object payloadArgs(Object[] args) {
		List<Object> filtered = new ArrayList<>();
		for (Object arg : args) {
			if (arg instanceof ServletRequest || arg instanceof ServletResponse) {
				continue;
			}
			filtered.add(arg);
		}
		if (filtered.isEmpty()) {
			return "";
		}
		if (filtered.size() == 1) {
			return filtered.getFirst();
		}
		return filtered;
	}

	private void completeQuietly(OperationView claim, Object result, Throwable error) {
		try {
			if (error != null) {
				client.complete(claim.operationId(), CompleteRequest.failed(500,
						"{\"error\":\"" + error.getClass().getSimpleName() + "\"}", claim.ownerToken()));
				return;
			}
			String body;
			int status = 200;
			if (result instanceof ResponseEntity<?> entity) {
				status = entity.getStatusCode().value();
				body = objectMapper.writeValueAsString(entity.getBody());
			}
			else {
				body = objectMapper.writeValueAsString(result);
			}
			client.complete(claim.operationId(), CompleteRequest.completed(status, body, claim.ownerToken()));
		}
		catch (Exception ignored) {
			// best-effort
		}
	}

	private String resolveBusinessKey(String expression, ProceedingJoinPoint pjp) {
		if (expression == null || expression.isBlank()) {
			return null;
		}
		MethodSignature signature = (MethodSignature) pjp.getSignature();
		String[] paramNames = names.getParameterNames(signature.getMethod());
		StandardEvaluationContext ctx = new StandardEvaluationContext();
		Object[] args = pjp.getArgs();
		if (paramNames != null) {
			for (int i = 0; i < paramNames.length; i++) {
				ctx.setVariable(paramNames[i], args[i]);
			}
		}
		Object value = parser.parseExpression(expression).getValue(ctx);
		return value == null ? null : String.valueOf(value);
	}

	private static HttpServletRequest currentRequest() {
		ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		return attrs == null ? null : attrs.getRequest();
	}
}
