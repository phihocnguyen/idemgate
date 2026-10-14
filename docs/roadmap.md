# IdemGate Roadmap

## Phase 1 — Idempotency Core (priority)

| Capability | Status | Notes |
|------------|--------|-------|
| Client authentication | Done | API key on `/v1/**`; Basic auth on `/v1/admin/**` |
| Scope + idempotency key + fingerprint + TTL | Done | Claim API + lease reclaim |
| Atomic claim + `IN_PROGRESS` / `COMPLETED` / `FAILED` / `UNKNOWN` | Done | SQLite `UNIQUE` + `ON CONFLICT DO NOTHING` |
| Response replay + duplicate handling | Done | Same key+fingerprint → snapshot; mismatch → `409 PAYLOAD_MISMATCH` |
| Route registration | Partial | Scope is the routing unit today; explicit route registry is later |

**Store:** SQLite file (single-container DX). See [ADR 0001](adr/0001-sqlite-atomic-claim.md).

## Phase 2 — Reliability

| Capability | Status | Notes |
|------------|--------|-------|
| Recovery / reconciliation on unclear timeout | Partial | Lease reclaim + `UNKNOWN`; richer reconcile UX still open |
| Metrics, tracing, audit log, alerts | Partial | Prometheus via Actuator; tracing/audit/alerts not built |
| Tenant/API policy, quota, retention control | Partial | Retention cleanup job exists; tenant/quota policy not built |
| HA / shared state (multi-instance) | Not started | SQLite is single-writer; shared store or Redis-backed coordination when scaling out |

## Phase 3 — Integration Platform

| Capability | Status | Notes |
|------------|--------|-------|
| SDKs (Java, TypeScript, Go, Python) | Partial | Java client + Spring Boot starter shipped |
| Dashboard for routes and policy | Partial | Ops console at `/ui` (ops search/metrics); route/policy admin later |
| Message broker + downstream idempotency | Not started | |
| Transactional outbox / workflow orchestration | Not started | Optional when callers need it |

## Principles

1. Phase 1 stays correct before Phase 2 complexity.
2. Side effects remain the caller's responsibility ([guarantees.md](guarantees.md)).
3. Multi-language SDKs and broker adapters build on a stable HTTP contract ([api-contract.md](api-contract.md)).
