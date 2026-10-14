# Architecture

Monorepo layout:

```
idemgate/
  server/                 # HTTP API + PostgreSQL registry
  idemgate-client/                 # Java SDK
  idemgate-spring-boot-starter/    # @Idempotent integration
  samples/demo-app/       # example consumer
  ui/                     # Next.js dashboard (Vercel Root Directory = ui)
  docs/
```

```mermaid
flowchart LR
  DemoApp --> Starter
  Starter --> Client
  Client --> Server
  Server --> Postgres
  Dashboard["ui/"] --> AdminAPI["/v1/admin/**"]
  AdminAPI --> Server
```

Server is the source of truth for claim/complete/lease. The starter encodes the claim → work → complete loop and fail-closed defaults. The dashboard reads `/v1/admin/**` (body redacted by default).
