import { HeroCanvas } from "@/components/HeroCanvas";
import {
  Band,
  ButtonOutline,
  ButtonPrimary,
  Card,
  Container,
  Divider,
  Eyebrow,
} from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IdemGate",
  description: "Claim once. Replay safely. A PostgreSQL-backed idempotency registry.",
};

export default function LandingPage() {
  return (
    <>
      <section className="relative isolate min-h-[min(100vh,920px)] overflow-hidden bg-canvas">
        <HeroCanvas />
        {/* Left-weighted vignette: keep copy readable, leave the right side for WebGL */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(10,10,10,0.92)_0%,rgba(10,10,10,0.55)_42%,rgba(10,10,10,0.15)_70%,rgba(10,10,10,0.35)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-canvas to-transparent"
          aria-hidden
        />

        <Container className="relative z-10 flex min-h-[min(100vh,920px)] flex-col justify-center px-6 py-16 motion-safe-rise animate-[rise_700ms_ease_both]">
          <Eyebrow className="mb-6">Idempotency registry</Eyebrow>
          <h1 className="text-display-xl text-ink">IdemGate</h1>
          <p className="mt-6 max-w-xl text-display-sm text-ink">Safe retries for side-effecting APIs.</p>
          <p className="mt-4 max-w-xl text-body-lg text-body">
            A PostgreSQL registry that claims work once, leases ownership, and replays the stored
            outcome when clients double-submit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonPrimary href="/integrate">Integration guide</ButtonPrimary>
            <ButtonOutline href="/operations">Open dashboard</ButtonOutline>
          </div>
          <p className="mt-10 text-caption-mono-sm text-mute">Move · explore the claim field</p>
        </Container>
      </section>

      <Divider />

      <Band>
        <Container>
          <Eyebrow className="mb-4">Registry · live operations</Eyebrow>
          <div className="grid gap-2">
            <RegistryRow
              delay="120ms"
              status="COMPLETED"
              tone="sunset"
              keyLabel="payments / ord_1842:charge"
              meta="replay ready"
            />
            <RegistryRow
              delay="240ms"
              status="IN_PROGRESS"
              tone="breeze"
              keyLabel="webhooks / evt_9f3a:deliver"
              meta="lease 42s"
            />
            <RegistryRow
              delay="360ms"
              status="UNKNOWN"
              tone="twilight"
              keyLabel="transfers / tx_77:settle"
              meta="reconcile"
            />
          </div>
        </Container>
      </Band>

      <Divider />

      <Band>
        <Container>
          <Eyebrow className="mb-4">Product</Eyebrow>
          <h2 className="text-display-md text-ink">A registry, not a proxy</h2>
          <p className="mt-4 max-w-2xl text-body-lg text-body">
            IdemGate stores claim identity, fingerprint, lease, and response snapshot. Your service
            still runs the business logic — the gate decides whether to execute or replay.
          </p>
        </Container>
      </Band>

      <Divider />

      <Band>
        <Container>
          <Eyebrow className="mb-4">The claim loop</Eyebrow>
          <h2 className="text-display-md text-ink">Three calls. One owner.</h2>
          <p className="mt-3 mb-8 max-w-xl text-body-lg text-body">Deterministic retries.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="transition duration-300 hover:border-white/25">
              <p className="text-caption-mono-sm text-mute">01</p>
              <h3 className="mt-3 text-display-xs text-ink">Claim</h3>
              <p className="mt-2 text-body-md text-body">
                Atomic insert on scope + key. Winner receives an owner token and lease.
              </p>
            </Card>
            <Card className="transition duration-300 hover:border-white/25">
              <p className="text-caption-mono-sm text-mute">02</p>
              <h3 className="mt-3 text-display-xs text-ink">Work</h3>
              <p className="mt-2 text-body-md text-body">
                Only the owner executes. Heartbeat extends the lease for long jobs.
              </p>
            </Card>
            <Card className="transition duration-300 hover:border-white/25">
              <p className="text-caption-mono-sm text-mute">03</p>
              <h3 className="mt-3 text-display-xs text-ink">Complete</h3>
              <p className="mt-2 text-body-md text-body">
                Store status + response. Later claims with the same key get a replay.
              </p>
            </Card>
          </div>
        </Container>
      </Band>

      <Divider />

      <Band>
        <Container className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow className="mb-4">Integrate</Eyebrow>
            <h2 className="text-display-md text-ink">Wire it in under an hour</h2>
            <p className="mt-4 text-body-lg text-body">
              HTTP API, Java SDK, or Spring `@Idempotent` — pick a path and verify in the dashboard.
            </p>
          </div>
          <ButtonPrimary href="/integrate">Start onboarding</ButtonPrimary>
        </Container>
      </Band>
    </>
  );
}

function RegistryRow({
  delay,
  status,
  tone,
  keyLabel,
  meta,
}: {
  delay: string;
  status: string;
  tone: "sunset" | "breeze" | "twilight";
  keyLabel: string;
  meta: string;
}) {
  const toneClass =
    tone === "sunset"
      ? "text-accent-sunset border-accent-sunset/40"
      : tone === "breeze"
        ? "text-accent-breeze border-accent-breeze/40"
        : "text-accent-twilight border-accent-twilight/40";

  return (
    <div
      className="motion-safe-slide grid items-center gap-2 rounded-sm border border-hairline bg-canvas-card px-6 py-4 font-mono text-body-sm animate-[slide-in_650ms_ease_both] transition duration-300 hover:border-white/20 md:grid-cols-[9rem_1fr_auto]"
      style={{ animationDelay: delay }}
    >
      <span className={`inline-block border px-2 py-1 text-caption-mono-sm ${toneClass}`}>{status}</span>
      <span className="truncate text-body">{keyLabel}</span>
      <span className="whitespace-nowrap text-mute">{meta}</span>
    </div>
  );
}
