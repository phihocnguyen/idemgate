# IdemGate Dashboard

Next.js admin UI for the IdemGate registry (Month 7).

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Styling uses **Tailwind CSS v4** + tokens from [`DESIGN.md`](DESIGN.md)
(xAI-inspired near-black canvas, Inter + Geist Mono, white outline pills).

Open http://localhost:3000. The UI calls the server admin API at
`NEXT_PUBLIC_IDEMGATE_URL` with `X-Api-Key: NEXT_PUBLIC_IDEMGATE_API_KEY`.

## Pages

- `/` — marketing landing
- `/integrate` — onboarding / integration guide (run → paths → claim loop → verify)
- `/operations` — operations list (filters: status / scope / key / businessKey / q)
- `/operations/[id]` — operation detail (response body redacted unless server exposes it)
- `/settings` — runtime settings (TTL, lease, retention, body exposure)

## Vercel

Set **Root Directory** to `ui` and configure the same env vars in the project settings.
The API host must allow CORS from your Vercel origin (dev already allows `localhost:3000`).
