# Demo scenarios

Prerequisites: `docker compose up --build` and `IDEMGATE_API_KEY` (default `dev-secret-change-me`).

```bash
export API=http://localhost:8080
export KEY=dev-secret-change-me
export FP=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

Or run the helper script:

```bash
./scripts/demo.sh
```

## 1. Double-click (two claims, one winner)

```bash
# Terminal A and B almost simultaneously — or run twice quickly:
curl -s -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"double-click-1\",\"fingerprint\":\"$FP\",\"ttlSeconds\":300}"
```

Expected: first response has `"claimed":true`; second has `"claimed":false` and `"status":"IN_PROGRESS"`.

## 2. Client timeout (claim without complete, then retry)

```bash
# Client "times out" after claim — never calls complete
curl -s -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"timeout-1\",\"fingerprint\":\"$FP\",\"ttlSeconds\":300}"

# Retry while still in progress
curl -s -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"timeout-1\",\"fingerprint\":\"$FP\",\"ttlSeconds\":300}"
```

Expected: second claim `"claimed":false`, `"status":"IN_PROGRESS"` — do **not** re-execute business logic.

After the real worker finishes:

```bash
OP=<operationId from first claim>
curl -s -X POST "$API/v1/operations/$OP/complete" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d '{"status":"COMPLETED","responseStatus":200,"responseBody":"{\"ok\":true}"}'
```

Further claims replay the stored response.

## 3. Server crash / uncertain outcome

Claim, then mark `UNKNOWN` instead of inventing success:

```bash
curl -s -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"crash-1\",\"fingerprint\":\"$FP\"}"

# Simulate crash after side effect may have happened:
curl -s -X POST "$API/v1/operations/<id>/complete" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d '{"status":"UNKNOWN","responseStatus":500,"responseBody":"{\"reason\":\"worker crashed\"}"}'
```

Later claims return `"status":"UNKNOWN"` — reconcile manually; do not blind-retry.

## 4. Health

```bash
curl -s "$API/actuator/health"
```
