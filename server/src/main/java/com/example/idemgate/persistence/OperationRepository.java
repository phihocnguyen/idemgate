package com.example.idemgate.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
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
				  request_method, request_path, owner_token, lease_expires_at, business_key,
				  expires_at, retain_until, created_at, updated_at
				) VALUES (
				  :id, :scope, :key, :fingerprint, :status,
				  :requestMethod, :requestPath, :ownerToken, :leaseExpiresAt, :businessKey,
				  :expiresAt, :retainUntil, :createdAt, :updatedAt
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
				.param("ownerToken", op.ownerToken())
				.param("leaseExpiresAt", Timestamp.from(op.leaseExpiresAt()))
				.param("businessKey", op.businessKey())
				.param("expiresAt", Timestamp.from(op.expiresAt()))
				.param("retainUntil", Timestamp.from(op.retainUntil()))
				.param("createdAt", Timestamp.from(op.createdAt()))
				.param("updatedAt", Timestamp.from(op.updatedAt()))
				.update();
		return rows == 1;
	}

	public Optional<Operation> findById(UUID id) {
		return jdbc.sql("SELECT * FROM operations WHERE id = :id").param("id", id).query(this::mapRow).optional();
	}

	public Optional<Operation> findByScopeAndKey(String scope, String key) {
		return jdbc.sql("SELECT * FROM operations WHERE scope = :scope AND idempotency_key = :key")
				.param("scope", scope).param("key", key).query(this::mapRow).optional();
	}

	public Optional<Operation> findByScopeAndKeyForUpdate(String scope, String key) {
		return jdbc.sql("SELECT * FROM operations WHERE scope = :scope AND idempotency_key = :key FOR UPDATE")
				.param("scope", scope).param("key", key).query(this::mapRow).optional();
	}

	public Optional<Operation> findByScopeAndBusinessKey(String scope, String businessKey) {
		return jdbc.sql("SELECT * FROM operations WHERE scope = :scope AND business_key = :businessKey")
				.param("scope", scope).param("businessKey", businessKey).query(this::mapRow).optional();
	}

	public boolean reclaimExpiredLease(UUID id, String fingerprint, String ownerToken, Instant leaseExpiresAt,
			Instant expiresAt, Instant retainUntil, Instant now) {
		int rows = jdbc.sql("""
				UPDATE operations
				SET fingerprint = :fingerprint,
				    status = 'IN_PROGRESS',
				    owner_token = :ownerToken,
				    lease_expires_at = :leaseExpiresAt,
				    response_status = NULL,
				    response_headers = NULL,
				    response_body = NULL,
				    expires_at = :expiresAt,
				    retain_until = :retainUntil,
				    updated_at = :now,
				    completed_at = NULL
				WHERE id = :id
				  AND status = 'IN_PROGRESS'
				  AND lease_expires_at < :now
				  AND fingerprint = :fingerprint
				""")
				.param("id", id)
				.param("fingerprint", fingerprint)
				.param("ownerToken", ownerToken)
				.param("leaseExpiresAt", Timestamp.from(leaseExpiresAt))
				.param("expiresAt", Timestamp.from(expiresAt))
				.param("retainUntil", Timestamp.from(retainUntil))
				.param("now", Timestamp.from(now))
				.update();
		return rows == 1;
	}

	public boolean complete(UUID id, String ownerToken, OperationStatus status, Integer responseStatus,
			Map<String, String> headers, String body, Instant retainUntil, Instant now) {
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
				  AND owner_token = :ownerToken
				""")
				.param("id", id)
				.param("ownerToken", ownerToken)
				.param("status", status.name())
				.param("responseStatus", responseStatus)
				.param("responseHeaders", toJson(headers))
				.param("responseBody", body)
				.param("retainUntil", Timestamp.from(retainUntil))
				.param("now", Timestamp.from(now))
				.update();
		return rows == 1;
	}

	public boolean heartbeat(UUID id, String ownerToken, Instant leaseExpiresAt, Instant now) {
		int rows = jdbc.sql("""
				UPDATE operations
				SET lease_expires_at = :leaseExpiresAt,
				    updated_at = :now
				WHERE id = :id
				  AND status = 'IN_PROGRESS'
				  AND owner_token = :ownerToken
				""")
				.param("id", id)
				.param("ownerToken", ownerToken)
				.param("leaseExpiresAt", Timestamp.from(leaseExpiresAt))
				.param("now", Timestamp.from(now))
				.update();
		return rows == 1;
	}

	public List<Operation> listByStatus(OperationStatus status, int limit) {
		return jdbc.sql("SELECT * FROM operations WHERE status = :status ORDER BY updated_at DESC LIMIT :limit")
				.param("status", status.name())
				.param("limit", limit)
				.query(this::mapRow)
				.list();
	}

	public List<Operation> search(OperationSearchQuery q) {
		StringBuilder sql = new StringBuilder("SELECT * FROM operations WHERE 1=1");
		appendSearchFilters(sql, q);
		sql.append(" ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
		return bindSearch(jdbc.sql(sql.toString()), q)
				.param("limit", q.limit())
				.param("offset", q.offset())
				.query(this::mapRow)
				.list();
	}

	public long countSearch(OperationSearchQuery q) {
		StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM operations WHERE 1=1");
		appendSearchFilters(sql, q);
		Long count = bindSearch(jdbc.sql(sql.toString()), q).query(Long.class).single();
		return count == null ? 0L : count;
	}

	private static void appendSearchFilters(StringBuilder sql, OperationSearchQuery q) {
		if (q.status() != null) {
			sql.append(" AND status = :status");
		}
		if (q.scope() != null && !q.scope().isBlank()) {
			sql.append(" AND scope = :scope");
		}
		if (q.key() != null && !q.key().isBlank()) {
			sql.append(" AND idempotency_key = :key");
		}
		if (q.businessKey() != null && !q.businessKey().isBlank()) {
			sql.append(" AND business_key = :businessKey");
		}
		if (q.q() != null && !q.q().isBlank()) {
			sql.append("""
					 AND (
					   idempotency_key ILIKE :qLike
					   OR COALESCE(request_path, '') ILIKE :qLike
					   OR CAST(id AS text) ILIKE :qLike
					   OR COALESCE(business_key, '') ILIKE :qLike
					 )
					""");
		}
		if (q.operationId() != null) {
			sql.append(" AND id = :operationId");
		}
		if (q.from() != null) {
			sql.append(" AND created_at >= :fromTs");
		}
		if (q.to() != null) {
			sql.append(" AND created_at <= :toTs");
		}
	}

	private static org.springframework.jdbc.core.simple.JdbcClient.StatementSpec bindSearch(
			org.springframework.jdbc.core.simple.JdbcClient.StatementSpec spec, OperationSearchQuery q) {
		if (q.status() != null) {
			spec = spec.param("status", q.status().name());
		}
		if (q.scope() != null && !q.scope().isBlank()) {
			spec = spec.param("scope", q.scope());
		}
		if (q.key() != null && !q.key().isBlank()) {
			spec = spec.param("key", q.key());
		}
		if (q.businessKey() != null && !q.businessKey().isBlank()) {
			spec = spec.param("businessKey", q.businessKey());
		}
		if (q.q() != null && !q.q().isBlank()) {
			spec = spec.param("qLike", "%" + q.q().trim() + "%");
		}
		if (q.operationId() != null) {
			spec = spec.param("operationId", q.operationId());
		}
		if (q.from() != null) {
			spec = spec.param("fromTs", Timestamp.from(q.from()));
		}
		if (q.to() != null) {
			spec = spec.param("toTs", Timestamp.from(q.to()));
		}
		return spec;
	}

	public List<String> listDistinctScopes() {
		return jdbc.sql("SELECT DISTINCT scope FROM operations ORDER BY scope")
				.query(String.class)
				.list();
	}

	public int deleteExpired(Instant now) {
		return jdbc.sql("DELETE FROM operations WHERE retain_until < :now")
				.param("now", Timestamp.from(now))
				.update();
	}

	private Operation mapRow(ResultSet rs, int rowNum) throws SQLException {
		Timestamp lease = rs.getTimestamp("lease_expires_at");
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
				rs.getString("owner_token"),
				lease != null ? lease.toInstant() : null,
				rs.getString("business_key"),
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
