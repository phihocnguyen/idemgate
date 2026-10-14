# Problem Statement

Backend services that accept retries, webhooks, or user double-submits need a reliable way to ensure a business operation runs at most once for a given client intent.

## Failure modes

| Scenario | What goes wrong without coordination |
|----------|--------------------------------------|
| **Double-click / duplicate submit** | Two HTTP requests with the same intent create two payments, orders, or side effects. |
| **Client timeout + retry** | The client times out while the server is still processing, then retries and creates a second execution. |
| **Webhook redelivery** | Providers redeliver the same event; naive handlers apply the effect twice. |
| **Server crash mid-flight** | The worker dies after starting work but before recording a final outcome; the client does not know whether to retry. |

## Why existing approaches fall short

- Ad-hoc `UNIQUE` constraints on business tables only cover one resource shape and do not standardize response replay.
- Redis locks expire and do not store the successful response for safe retry.
- Per-service home-grown state machines diverge and are easy to get wrong under concurrency.

## What IdemGate is

IdemGate is an **idempotency registry**. Clients **claim** an operation by `(scope, key)`, run their own business logic if they win the claim, then **complete** with a stored response snapshot. Later requests with the same key and fingerprint **replay** that outcome instead of re-executing.

See [guarantees.md](guarantees.md) for the exact contract boundaries.
