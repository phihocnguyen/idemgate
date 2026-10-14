package com.example.idemgate.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.example.idemgate.domain.Operation;
import com.example.idemgate.domain.OperationStatus;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Repository
public class OperationRepository {

	private static final TypeReference<Map<String, String>> HEADER_TYPE = new TypeReference<>() {
	};

	private final JdbcClient jdbc;
	private final ObjectMapper objectMapper;

	public OperationRepository(JdbcClient jdbc, ObjectMapper objectMapper) {
		this.jdbc = jdbc;
		this.objectMapper = objectMapper;
	}

	public boolean insert(Operation op) {
		int rows = jdbc.sql("""
				INSERT INTO operations (
				  id, scope, idempotency_key, fingerprint, status,
				  request_method, request_path, expires_at, retain_until,
				  created_at, updated_at
				) VALUES (
				  :id, :scope, :key, :fingerprint, :status,
				  :requestMethod, :requestPath, :expiresAt, :retainUntil,
				  :createdAt, :updatedAt
				)
				ON CONFLICT (scope, idempotency_key) DO NOTHING
				""")
				.param("id", op.id())
				.param("scope", op.scope())
				.param("key", op.idempotencyKey())
				.param("fingerprint", op.fingerprint())
				.param("status", op.status().name())
				.param("requestMethod", op.requestMethod())
				.param("requestPath", op.requestPath())
				.param("expiresAt", Timestamp.from(op.expiresAt()))
				.param("retainUntil", Timestamp.from(op.retainUntil()))
				.param("createdAt", Timestamp.from(op.createdAt()))
				.param("updatedAt", Timestamp.from(op.updatedAt()))
				.update();
		return rows == 1;
	}

	public Optional<Operation> findById(UUID id) {
		return jdbc.sql("SELECT * FROM operations WHERE id = :id")
				.param("id", id)
				.query(this::mapRow)
				.optional();
	}

	public Optional<Operation> findByScopeAndKey(String scope, String key) {
		return jdbc.sql("""
				SELECT * FROM operations
				WHERE scope = :scope AND idempotency_key = :key
				""")
				.param("scope", scope)
				.param("key", key)
				.query(this::mapRow)
				.optional();
	}

	public Optional<Operation> findByScopeAndKeyForUpdate(String scope, String key) {
		return jdbc.sql("""
				SELECT * FROM operations
				WHERE scope = :scope AND idempotency_key = :key
				FOR UPDATE
				""")
				.param("scope", scope)
				.param("key", key)
				.query(this::mapRow)
				.optional();
	}

	public boolean reclaimExpiredInProgress(UUID id, String fingerprint, Instant expiresAt, Instant retainUntil,
			Instant now) {
		int rows = jdbc.sql("""
				UPDATE operations
				SET fingerprint = :fingerprint,
				    status = 'IN_PROGRESS',
				    response_status = NULL,
				    response_headers = NULL,
				    response_body = NULL,
				    expires_at = :expiresAt,
				    retain_until = :retainUntil,
				    updated_at = :now,
				    completed_at = NULL
				WHERE id = :id
				  AND status = 'IN_PROGRESS'
				  AND expires_at < :now
				  AND fingerprint = :fingerprint
				""")
				.param("id", id)
				.param("fingerprint", fingerprint)
				.param("expiresAt", Timestamp.from(expiresAt))
				.param("retainUntil", Timestamp.from(retainUntil))
				.param("now", Timestamp.from(now))
				.update();
		return rows == 1;
	}

	public boolean complete(UUID id, OperationStatus status, Integer responseStatus, Map<String, String> headers,
			String body, Instant retainUntil, Instant now) {
		int rows = jdbc.sql("""
				UPDATE operations
				SET status = :status,
				    response_status = :responseStatus,
				    response_headers = CAST(:responseHeaders AS jsonb),
				    response_body = :responseBody,
				    retain_until = :retainUntil,
				    updated_at = :now,
				    completed_at = :now
				WHERE id = :id
				  AND status = 'IN_PROGRESS'
				""")
				.param("id", id)
				.param("status", status.name())
				.param("responseStatus", responseStatus)
				.param("responseHeaders", toJson(headers))
				.param("responseBody", body)
				.param("retainUntil", Timestamp.from(retainUntil))
				.param("now", Timestamp.from(now))
				.update();
		return rows == 1;
	}

	public int deleteExpired(Instant now) {
		return jdbc.sql("DELETE FROM operations WHERE retain_until < :now")
				.param("now", Timestamp.from(now))
				.update();
	}

	private Operation mapRow(ResultSet rs, int rowNum) throws SQLException {
		return new Operation(
				rs.getObject("id", UUID.class),
				rs.getString("scope"),
				rs.getString("idempotency_key"),
				rs.getString("fingerprint"),
				OperationStatus.valueOf(rs.getString("status")),
				rs.getString("request_method"),
				rs.getString("request_path"),
				(Integer) rs.getObject("response_status"),
				parseHeaders(rs.getString("response_headers")),
				rs.getString("response_body"),
				rs.getTimestamp("expires_at").toInstant(),
				rs.getTimestamp("retain_until").toInstant(),
				rs.getTimestamp("created_at").toInstant(),
				rs.getTimestamp("updated_at").toInstant(),
				rs.getTimestamp("completed_at") != null ? rs.getTimestamp("completed_at").toInstant() : null);
	}

	private Map<String, String> parseHeaders(String json) {
		if (json == null || json.isBlank()) {
			return Map.of();
		}
		try {
			Map<String, String> headers = objectMapper.readValue(json, HEADER_TYPE);
			return headers != null ? headers : Map.of();
		}
		catch (Exception e) {
			return Map.of();
		}
	}

	private String toJson(Map<String, String> headers) {
		Map<String, String> safe = headers != null ? headers : new LinkedHashMap<>();
		return objectMapper.writeValueAsString(safe);
	}
}
