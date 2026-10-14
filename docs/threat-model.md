# Threat Model (Q1 MVP)

## Assets

- Idempotency records (`scope`, key, fingerprint, stored responses)
- API credentials (`X-Api-Key`)
- Database contents

## Threats and mitigations

| Threat | Risk | Q1 mitigation |
|--------|------|---------------|
| **Key guessing / cross-tenant replay** | Attacker reuses another client's key to observe or block outcomes | Require `X-Api-Key`; isolate by `scope`; use high-entropy keys client-side |
| **Cross-scope leak** | Same key string in different scopes | Keys are unique per `(scope, key)` only |
| **Payload stuffing** | Huge response bodies fill disk | Cap `responseBody` size; reject with `413` |
| **Fingerprint collision abuse** | Two different payloads map to same hash | Client must use SHA-256 of canonical bytes; document canonicalization |
| **Unauthenticated access** | Anyone claims/completes | Spring Security filter on `/v1/**` |
| **Sensitive data in storage** | PII in response snapshots | Do not store raw request bodies; callers should redact response bodies |
| **Expired IN_PROGRESS stuck forever** | Dead worker blocks key | TTL + reclaim on new claim after `expires_at` |

## Out of Q1

- RBAC / multi-tenant projects (Q3)
- Key rotation UI, audit log export (Q3)
- TLS termination guidance beyond Docker defaults (Q3)
