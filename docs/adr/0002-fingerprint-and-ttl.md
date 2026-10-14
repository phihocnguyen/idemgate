# ADR 0002: Request fingerprint and TTL / retention

## Status

Accepted

## Context

Clients may reuse an idempotency key with a different payload (bug or attack). In-progress operations may never complete if the worker dies.

## Decision

### Fingerprint

- Client sends a SHA-256 hex digest of its canonical request representation.
- IdemGate stores the digest only (not the raw body).
- On claim against an existing active record, if digests differ → `409 PAYLOAD_MISMATCH`.

### TTL

- Each claim sets `expires_at = now + ttl`.
- If status is `IN_PROGRESS` and `now > expires_at`, a new claim with the **same** fingerprint may **reclaim** the row (reset timers, keep id or rotate — Q1 resets `expires_at` / `updated_at` and returns `claimed=true`).
- Mismatched fingerprint on an expired in-progress row still yields `PAYLOAD_MISMATCH` (key is reserved until retention deletes it, unless we allow reclaim only for same fingerprint — same-fingerprint reclaim only).

### Retention

- On create/complete, set `retain_until` from config (default days after create or complete).
- A scheduled job deletes rows where `retain_until < now`.

## Consequences

- Callers must compute fingerprints consistently.
- Reclaim after TTL can re-run business logic; callers should design operations to be safe under that policy or complete before expiry.
