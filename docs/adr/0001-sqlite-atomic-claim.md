# ADR 0001: SQLite atomic claim via unique constraint

## Status

Accepted (supersedes PostgreSQL; Q1 uses SQLite only)

## Context

Concurrent clients may claim the same `(scope, key)`. We need exactly one winner without depending on a single JVM's memory or an external lock service. Ops should match a Redis-like single-container DX (no separate database service).

## Decision

Use SQLite as the source of truth:

1. `UNIQUE (scope, idempotency_key)` on `operations`.
2. Claim path: `INSERT ... ON CONFLICT DO NOTHING` inside a transaction.
3. If insert affects 0 rows, `SELECT` the existing row and return its status (after fingerprint checks / TTL reclaim).
4. Persist the DB file on a volume (`IDEMGATE_DB_PATH` / `SPRING_DATASOURCE_URL`).

No Redis distributed lock for Q1. No external Postgres process.

## Consequences

- One container / one process is enough for local and Docker Compose.
- Multiple IdemGate replicas that share the same SQLite file are not supported; scale vertically or move the registry later if needed.
- Claim latency is bound by SQLite write serialization and disk I/O on hot keys.
- Schema migrations and backup (copy the `.db` file) remain part of the operational surface.
