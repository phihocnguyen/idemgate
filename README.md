# IdemGate

Idempotency registry + Java SDK + Spring Boot starter (monorepo).

## Modules

| Path | Role |
|------|------|
| [`server/`](server/) | SQLite-backed claim/complete/lease API |
| [`idemgate-client/`](idemgate-client/) | Java HTTP SDK |
| [`idemgate-spring-boot-starter/`](idemgate-spring-boot-starter/) | `@Idempotent` + `Idempotency-Key` |
| [`samples/demo-app/`](samples/demo-app/) | Payment + webhook sample |
| [`web/`](web/) | Ops console (Vite React; embedded at `/ui` in the server image) |

## Quick start (server)

```bash
export IDEMGATE_API_KEY=dev-secret-change-me
docker compose up --build
```

API + Ops UI: `http://localhost:8080` (`/ui/`) · Health: `/actuator/health`

```bash
./mvnw -pl server -am test
./mvnw -pl server -am spring-boot:run
```

### Claim / complete

```bash
curl -s -X POST http://localhost:8080/v1/operations/claim \
  -H "Content-Type: application/json" -H "X-Api-Key: dev-secret-change-me" \
  -d '{"scope":"payments","key":"ord_123:pay","fingerprint":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'
# use operationId + ownerToken from response on complete
```

## Demo app (starter)

```bash
# terminal 1: server
./mvnw -pl server -am spring-boot:run

# terminal 2: sample on :8081
./mvnw -pl samples/demo-app -am spring-boot:run

curl -s -X POST http://localhost:8081/api/orders/ord_1/charges \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-key-1" \
  -d '{"currency":"USD","amountCents":1000}'
```

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/roadmap.md](docs/roadmap.md) | Phase 1–3 product roadmap |
| [docs/problem-statement.md](docs/problem-statement.md) | Why IdemGate exists |
| [docs/guarantees.md](docs/guarantees.md) | Guarantees |
| [docs/api-contract.md](docs/api-contract.md) | HTTP API |
| [docs/architecture.md](docs/architecture.md) | Monorepo architecture |
| [docs/fingerprint.md](docs/fingerprint.md) | Fingerprint canonicalization |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Ops / integration issues |
| [docs/git-convention.md](docs/git-convention.md) | Conventional Commits |
| [docs/demo.md](docs/demo.md) | Failure-mode demos |
| [web/README.md](web/README.md) | Ops console (dev + Docker embed) |

## Ops dashboard (`web/` → `/ui` on container port)

UI is static files inside the server jar — same port as the API (default **8080**).

```bash
# 1) Build UI into server/src/main/resources/static/ui/
cd web && npm install && npm run build:embed && cd ..

# 2) Run backend only
./mvnw -pl server -am spring-boot:run

# → http://localhost:8080/ui/   login admin / admin
```

Docker:

```bash
docker compose up --build
# → http://localhost:8080/ui/
```

Hot-reload frontend (optional): `cd web && npm run dev` → http://localhost:5173/ (needs API on :8080).

## Configuration (server)

| Env | Default | Meaning |
|-----|---------|---------|
| `IDEMGATE_API_KEY` | `dev-secret-change-me` | Claim/complete API key |
| `IDEMGATE_DB_PATH` | `./data/idemgate.db` | SQLite file path (or set `SPRING_DATASOURCE_URL`) |
| `IDEMGATE_OPS_USERNAME` | `admin` | Ops console Basic user |
| `IDEMGATE_OPS_PASSWORD` | `admin` | Ops console Basic password |
| `idemgate.default-ttl-seconds` | `300` | Operation TTL |
| `idemgate.default-lease-seconds` | `60` | Owner lease before reclaim |
| `idemgate.expose-response-body` | `false` | Include bodies in admin detail |
| `IDEMGATE_CORS_ORIGINS` | `http://localhost:5173,...` | Dev dashboard origins |
