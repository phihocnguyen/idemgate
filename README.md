# IdemGate

Idempotency registry for backend services. Claim an operation by `(scope, key)`, run your business logic if you win, then complete with a response snapshot. Retries with the same fingerprint replay the stored outcome.

**Q1 MVP** — PostgreSQL-backed atomic claim, fingerprint checks, TTL/retention, Docker Compose.

## Quick start

```bash
# from this directory (idemgate/)
export IDEMGATE_API_KEY=dev-secret-change-me
docker compose up --build
```

API: `http://localhost:8080`  
Health: `http://localhost:8080/actuator/health`

### Claim

```bash
curl -s -X POST http://localhost:8080/v1/operations/claim \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: dev-secret-change-me" \
  -d '{
    "scope": "payments",
    "key": "ord_123:pay",
    "fingerprint": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "ttlSeconds": 300
  }'
```

### Complete (use `operationId` from claim)

```bash
curl -s -X POST http://localhost:8080/v1/operations/<operationId>/complete \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: dev-secret-change-me" \
  -d '{
    "status": "COMPLETED",
    "responseStatus": 201,
    "responseHeaders": {"Content-Type": "application/json"},
    "responseBody": "{\"chargeId\":\"ch_1\"}"
  }'
```

### Look up

```bash
curl -s "http://localhost:8080/v1/operations?scope=payments&key=ord_123:pay" \
  -H "X-Api-Key: dev-secret-change-me"
```

## Local development (without Docker app)

```bash
docker compose up -d postgres
./mvnw spring-boot:run
```

Default datasource matches `docker-compose.yml` (see `application.yaml`).

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/problem-statement.md](docs/problem-statement.md) | Why IdemGate exists |
| [docs/guarantees.md](docs/guarantees.md) | What is / is not guaranteed |
| [docs/api-contract.md](docs/api-contract.md) | HTTP API |
| [docs/threat-model.md](docs/threat-model.md) | Security threats |
| [docs/test-strategy.md](docs/test-strategy.md) | Testing approach |
| [docs/demo.md](docs/demo.md) | Failure-mode demos |
| [docs/adr/](docs/adr/) | Architecture decisions |

## Configuration

| Env / property | Default | Meaning |
|----------------|---------|---------|
| `IDEMGATE_API_KEY` / `idemgate.api-key` | `dev-secret-change-me` | API key for `/v1/**` |
| `idemgate.default-ttl-seconds` | `300` | Claim TTL |
| `idemgate.retention-days` | `7` | When records become eligible for deletion |
| `idemgate.max-response-body-bytes` | `65536` | Max stored response body |

## License

Apache-2.0 (see project root when published).
