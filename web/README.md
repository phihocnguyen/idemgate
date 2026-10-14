# IdemGate Ops (web)

Prometheus-style operations console. Served by the **backend** on the container port (default **8080**), path `/ui/`.

## Backend-only (recommended)

```bash
cd web
npm install
npm run build:embed   # → server/src/main/resources/static/ui/

# from repo root
./mvnw -pl server -am spring-boot:run
```

Open **http://localhost:8080/ui/** — login `admin` / `admin`.

Docker:

```bash
docker compose up --build
# → http://localhost:8080/ui/
```

## Frontend-only dev (hot reload)

Needs the API on `:8080`:

```bash
npm run dev
# → http://localhost:5173/   (proxies /v1 → :8080)
```
