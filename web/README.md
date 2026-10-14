# IdemGate Ops (web)

Prometheus-style operations console. Served by the **backend** on the ops port (default **15672**), path `/ui/`.

## Backend-only (recommended)

```bash
cd web
npm install
npm run build:embed   # → server/src/main/resources/static/ui/

# from repo root
./mvnw -pl server -am spring-boot:run
```

- Ops: **http://localhost:15672/ui/** — login `admin` / `admin`
- API: **http://localhost:8080**

Docker:

```bash
docker compose up --build
# → http://localhost:15672/ui/
```

## Frontend-only dev (hot reload)

Needs the API on `:8080`:

```bash
npm run dev
# → http://localhost:5173/   (base `/` in dev; proxies /v1 → :8080)
```
