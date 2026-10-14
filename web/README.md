# IdemGate Ops (web)

Prometheus-style operations console. Embedded in the server image at **`/ui/`**.

## Dev

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173/ui/ — Vite proxies `/v1` → `http://localhost:8080`.

Login: **admin / admin** (must match server `idemgate.ops.*`).

## Production build

```bash
npm run build
```

Output in `dist/` is copied into the server jar as `classpath:/static/ui/` (see `server/Dockerfile`).
