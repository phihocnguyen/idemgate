# ADR 0001: PostgreSQL atomic claim via unique constraint

## Status

Accepted

## Context

Concurrent clients may claim the same `(scope, key)`. We need exactly one winner without depending on a single JVM's memory or an external lock service.

## Decision

Use PostgreSQL as the source of truth:

1. `UNIQUE (scope, idempotency_key)` on `operations`.
2. Claim path: `INSERT ... ON CONFLICT DO NOTHING` inside a transaction.
3. If insert affects 0 rows, `SELECT` the existing row and return its status (after fingerprint checks / TTL reclaim).

No Redis distributed lock for Q1.

## Consequences

- Multiple IdemGate replicas remain correct as long as they share the same database.
- Claim latency is bound by DB round-trip and contention on hot keys.
- Schema migrations and backup become part of the operational surface.
