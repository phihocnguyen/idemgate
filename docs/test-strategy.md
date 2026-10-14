# Test Strategy (Q1)

## Unit tests

- State transition rules (complete only from `IN_PROGRESS`)
- Fingerprint mismatch detection
- TTL reclaim eligibility
- Response size validation

## Integration tests

- Spring Boot + file-backed SQLite (`SqliteTestConfig`, temp DB file)
- Claim → complete → claim again (replay)
- Claim → second claim while `IN_PROGRESS`
- GET by id and by scope+key
- API key rejection (`401`)

## Concurrency tests

- N parallel claims with the same `(scope, key, fingerprint)` → exactly one `claimed=true`
- Parallel claim + complete races resolve to a consistent terminal state

## Manual / demo

See [demo.md](demo.md) for double-click, client timeout, and crash scenarios runnable via Docker Compose.
