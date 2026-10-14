# IdemGate UI

Placeholder for the future dashboard / marketing site.

## Deploy on Vercel

1. Create a Vercel project from this Git repo.
2. Set **Root Directory** to `ui`.
3. Use your framework build (`npm run build` / Next.js defaults).
4. Point API calls at the IdemGate server via env (e.g. `NEXT_PUBLIC_IDEMGATE_URL`).

Do **not** build Java modules on Vercel. The server runs elsewhere (Docker / VM / PaaS).

## Local (later)

```bash
cd ui
npm install
npm run dev
```
