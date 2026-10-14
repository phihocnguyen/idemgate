# IdemGate UI

Marketing landing at `/` and interactive Three.js claim bench at `/bench`.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

- `app/page.tsx` — landing
- `app/bench/page.tsx` — ClaimBench (Three.js)
- `components/landing/` — page sections
- `components/device/` — interactive device demo (editor / ops / CLI screens)
- `components/ui/` — Button, Container, Section, Reveal
- `lib/landing/` — mock data, samples, syntax, chart math

## Stack

- Next.js App Router
- Tailwind CSS v4 + [`DESIGN.md`](DESIGN.md) tokens
- Three.js + GSAP on `/bench`
