# Troubleshooting

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| `401` on `/v1/**` | Wrong/missing `X-Api-Key` | Match `IDEMGATE_API_KEY` |
| `409 PAYLOAD_MISMATCH` | Same key, different fingerprint | Fix canonicalization; new key if intentional change |
| `409 OWNERSHIP_MISMATCH` | complete/heartbeat without claim token | Use `ownerToken` from claim |
| `409 IN_PROGRESS` (starter) | Duplicate while lease held | Wait or poll; do not re-execute |
| `409 UNKNOWN` | Prior uncertain outcome | Reconcile via `GET /v1/operations?status=UNKNOWN`; do not blind-retry |
| `409 BUSINESS_KEY_CONFLICT` | Same business key, different idempotency key | Reuse original key or change business key |
| Starter fails closed | IdemGate unreachable | Start server; or set `idemgate.client.fail-closed=false` only if acceptable |
| Lease reclaim re-ran work | Worker died past lease | Ensure heartbeat for long jobs; design side effects for reclaim |

## Transaction boundaries

IdemGate does **not** wrap your DB transaction. Typical pattern:

1. Claim
2. Local transaction + outbox row
3. Complete with response snapshot
4. Publish outbox asynchronously

External side effects (payment provider) should use the provider's idempotency key when available, keyed off the same business intent.
