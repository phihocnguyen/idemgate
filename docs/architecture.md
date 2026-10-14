# Architecture

Monorepo layout:

```
idemgate/
  server/                 # HTTP API + PostgreSQL registry
  idemgate-client/                 # Java SDK
  idemgate-spring-boot-starter/    # @Idempotent integration
  samples/demo-app/       # example consumer
  ui/                     # future frontend (Vercel Root Directory = ui)
  docs/
```

```mermaid
flowchart LR
  DemoApp --> Starter
  Starter --> Client
  Client --> Server
  Server --> Postgres
  FutureUI["ui/"] -.-> Server
```

Server is the source of truth for claim/complete/lease. The starter encodes the claim → work → complete loop and fail-closed defaults.
