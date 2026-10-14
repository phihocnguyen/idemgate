# IdemGate Guarantees (Q1 MVP)

IdemGate coordinates idempotent execution. It does **not** run business logic or replace your database transactions.

## In scope

| Guarantee | Description |
|-----------|-------------|
| Atomic claim | At most one successful claim per `(scope, idempotency_key)` while the record is active. |
| Same key + same fingerprint | Subsequent claims receive the current status and, when terminal, the stored response snapshot (replay). |
| Same key + different fingerprint | Rejected with HTTP `409` and error code `PAYLOAD_MISMATCH`. |
| Concurrent claims | Exactly one request wins the insert; others observe `IN_PROGRESS` (or a terminal state if completion raced ahead). |
| TTL | `IN_PROGRESS` records past `expires_at` may be reclaimed by a new claim with the same fingerprint. |
| Retention | Records past `retain_until` are deleted by a scheduled cleanup job. |

## Out of scope

| Non-guarantee | Why |
|---------------|-----|
| Exactly-once delivery to external systems | Side effects (payments, emails, queues) remain the caller's responsibility. |
| Business transaction / outbox replacement | IdemGate sits beside your write path; it does not wrap it. |
| Unlimited payload storage | Response bodies are size-capped; request bodies are not stored—only a client-supplied fingerprint hash. |
| Cross-instance in-memory state | All coordination is in PostgreSQL so multiple replicas stay consistent. |

## State machine

```
IN_PROGRESS ──► COMPLETED
     │
     ├──► FAILED
     │
     └──► UNKNOWN
```

- **IN_PROGRESS** — claim won; caller should execute work then complete.
- **COMPLETED** / **FAILED** — terminal; response snapshot is replayed.
- **UNKNOWN** — caller explicitly marks an uncertain outcome (e.g. crash after side effect). Q1 exposes the state; lease-based recovery is planned for Q2.
