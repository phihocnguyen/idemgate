# API Contract (v1)

Base path: `/v1`  
Auth: header `X-Api-Key: <key>` (required for all `/v1/**` routes)

## POST /v1/operations/claim

### Request

```json
{
  "scope": "payments",
  "key": "ord_123:pay",
  "fingerprint": "a1b2c3...sha256hex",
  "ttlSeconds": 300,
  "requestMethod": "POST",
  "requestPath": "/api/charges",
  "businessKey": "order:ord_123:charge"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `scope` / `key` / `fingerprint` | yes | Unique claim identity |
| `ttlSeconds` | no | Defaults to server config |
| `businessKey` | no | Optional unique `(scope, businessKey)` |

### Response `200`

Includes `claimed`, `status`, and **`ownerToken` only when `claimed=true`**.

| `claimed` | `status` | Action |
|-----------|----------|--------|
| `true` | `IN_PROGRESS` | Execute work; heartbeat if long; then complete with `ownerToken` |
| `false` | `IN_PROGRESS` | Do not execute (lease held) |
| `false` | `COMPLETED` / `FAILED` | Replay `response` |
| `false` | `UNKNOWN` | Reconcile; do not blind-retry |

### Errors

| HTTP | Code |
|------|------|
| `409` | `PAYLOAD_MISMATCH` |
| `409` | `BUSINESS_KEY_CONFLICT` |
| `400` | `VALIDATION_ERROR` |
| `401` | unauthorized |

---

## POST /v1/operations/{operationId}/complete

Requires `ownerToken` from the winning claim.

```json
{
  "status": "COMPLETED",
  "responseStatus": 201,
  "responseHeaders": { "Content-Type": "application/json" },
  "responseBody": "{\"chargeId\":\"ch_1\"}",
  "ownerToken": "…"
}
```

Errors: `404`, `409 INVALID_STATE`, `409 OWNERSHIP_MISMATCH`, `413 RESPONSE_TOO_LARGE`.

---

## POST /v1/operations/{operationId}/heartbeat

Extends lease while work is still running.

```json
{ "ownerToken": "…" }
```

---

## GET /v1/operations/{operationId}

## GET /v1/operations?scope=&key=

## GET /v1/operations?status=UNKNOWN&limit=50

Lists UNKNOWN operations for reconciliation (no scope/key required).

---

## Admin API

Dashboard / ops inspection. Same `X-Api-Key` auth. Response bodies are **redacted by default**
(`idemgate.expose-response-body=false`); list never returns body content.

### GET /v1/admin/operations

Query params: `status`, `scope`, `key`, `businessKey`, `q` (ILIKE on key/path/id/businessKey),
`operationId`, `from`, `to` (ISO-8601), `limit` (1–200, default 50), `offset`.

```json
{
  "items": [{ "operationId": "…", "status": "COMPLETED", "responseBodyPresent": true, "responseBody": null }],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### GET /v1/admin/operations/{operationId}

Full metadata; `responseBody` only when `expose-response-body=true`.

### GET /v1/admin/settings

Returns retention, default TTL/lease, max body bytes, `exposeResponseBody`, and distinct `scopes`.

### PATCH /v1/admin/settings

Partial update of the same knobs (in-memory for the running process).
