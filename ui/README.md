# IdemGate UI

Two surfaces in this Next.js app:

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing |
| `/bench` | Interactive ClaimBench demo |
| `/ops` | **Ops console** (Month 7 dashboard) — login `admin` / `admin` |

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Ops console env

```bash
# UI gate (defaults shown)
OPS_USER=admin
OPS_PASSWORD=admin

# Backend admin API
NEXT_PUBLIC_IDEMGATE_URL=http://localhost:8080
NEXT_PUBLIC_IDEMGATE_API_KEY=dev-secret-change-me
```

Ops UI calls `/v1/admin/**` with the API key. Response bodies stay redacted unless `exposeResponseBody` is enabled in Settings (or server `idemgate.expose-response-body=true`).

## Structure

- `app/page.tsx` — landing
- `app/bench/` — ClaimBench
- `app/ops/` — operations list, detail, settings, login
- `components/landing/` — marketing sections
- `components/device/` — interactive device demo
- `components/ops/` — dashboard panels
- `lib/api.ts` — admin API client
- `lib/landing/` — marketing mock data

## Stack

- Next.js App Router
- Tailwind CSS v4 + [`DESIGN.md`](DESIGN.md) tokens
- Three.js + GSAP on `/bench`
