# API Contract (v1)

Base path: `/v1`  
Auth: header `X-Api-Key: <key>` (required for all `/v1/**` routes)

## POST /v1/operations/claim

Register or look up an operation.

### Request

```json
{
  "scope": "payments",
  "key": "ord_123:pay",
  "fingerprint": "a1b2c3...sha256hex",
  "ttlSeconds": 300,
  "requestMethod": "POST",
  "requestPath": "/api/charges"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `scope` | yes | Namespace; max 128 chars |
| `key` | yes | Idempotency key within scope; max 256 chars |
| `fingerprint` | yes | SHA-256 hex (64 chars) of canonical request payload |
| `ttlSeconds` | no | Defaults to server config |
| `requestMethod` / `requestPath` | no | Metadata only |

### Response `200`

```json
{
  "operationId": "550e8400-e29b-41d4-a716-446655440000",
  "claimed": true,
  "status": "IN_PROGRESS",
  "scope": "payments",
  "key": "ord_123:pay",
  "fingerprint": "a1b2c3...",
  "expiresAt": "2026-10-14T12:05:00Z",
  "response": null
}
```

| `claimed` | `status` | Caller action |
|-----------|----------|---------------|
| `true` | `IN_PROGRESS` | Execute business logic, then complete |
| `false` | `IN_PROGRESS` | Wait / poll; do not execute |
| `false` | `COMPLETED` / `FAILED` | Replay `response` |
| `false` | `UNKNOWN` | Do not blind-retry; reconcile manually |

### Errors

| HTTP | Code | When |
|------|------|------|
| `409` | `PAYLOAD_MISMATCH` | Existing key with different fingerprint |
| `400` | `VALIDATION_ERROR` | Invalid body |
| `401` | — | Missing/invalid API key |

---

## POST /v1/operations/{operationId}/complete

Finalize an operation you claimed.

### Request

```json
{
  "status": "COMPLETED",
  "responseStatus": 201,
  "responseHeaders": { "Content-Type": "application/json" },
  "responseBody": "{\"chargeId\":\"ch_1\"}"
}
```

`status` must be `COMPLETED`, `FAILED`, or `UNKNOWN`.

### Response `200`

Full operation view (same shape as GET).

### Errors

| HTTP | Code | When |
|------|------|------|
| `404` | `NOT_FOUND` | Unknown id |
| `409` | `INVALID_STATE` | Already terminal, or not owned for completion |
| `413` | `RESPONSE_TOO_LARGE` | Body exceeds configured max |

---

## GET /v1/operations/{operationId}

Return one operation by id.

## GET /v1/operations?scope={scope}&key={key}

Return one operation by scope + key. `404` if missing.
