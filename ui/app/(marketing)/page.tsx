import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IdemGate",
  description: "Claim once. Replay safely. A PostgreSQL-backed idempotency registry.",
};

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-brand">IdemGate</p>
          <h1 className="hero-headline">Safe retries for side-effecting APIs.</h1>
          <p className="hero-support">
            A PostgreSQL registry that claims work once, leases ownership, and replays the stored
            outcome when clients double-submit.
          </p>
          <div className="hero-ctas">
            <Link href="/integrate" className="btn btn-primary">
              Integration guide
            </Link>
            <Link href="/operations" className="btn btn-ghost">
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="pulse-line" />
          <div className="registry-board">
            <div className="registry-label">Registry · live operations</div>
            <div className="registry-rows">
              <div className="registry-row">
                <span className="st st-done">COMPLETED</span>
                <span className="registry-key">payments / ord_1842:charge</span>
                <span className="registry-meta">replay ready</span>
              </div>
              <div className="registry-row">
                <span className="st st-progress">IN_PROGRESS</span>
                <span className="registry-key">webhooks / evt_9f3a:deliver</span>
                <span className="registry-meta">lease 42s</span>
              </div>
              <div className="registry-row">
                <span className="st st-unknown">UNKNOWN</span>
                <span className="registry-key">transfers / tx_77:settle</span>
                <span className="registry-meta">reconcile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>A registry, not a proxy</h2>
        <p className="section-lead">
          IdemGate stores claim identity, fingerprint, lease, and response snapshot. Your service
          still runs the business logic — the gate decides whether to execute or replay.
        </p>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2>The claim loop</h2>
        <p className="section-lead">Three calls. One owner. Deterministic retries.</p>
        <div className="flow">
          <div className="flow-step">
            <div className="flow-num">01</div>
            <h3>Claim</h3>
            <p>Atomic insert on scope + key. Winner receives an owner token and lease.</p>
          </div>
          <div className="flow-step">
            <div className="flow-num">02</div>
            <h3>Work</h3>
            <p>Only the owner executes. Heartbeat extends the lease for long jobs.</p>
          </div>
          <div className="flow-step">
            <div className="flow-num">03</div>
            <h3>Complete</h3>
            <p>Store status + response. Later claims with the same key get a replay.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="integrate-cta">
          <div>
            <h2>Wire it in under an hour</h2>
            <p className="section-lead" style={{ marginBottom: 0 }}>
              HTTP API, Java SDK, or Spring `@Idempotent` — pick a path and verify in the dashboard.
            </p>
          </div>
          <Link href="/integrate" className="btn btn-primary">
            Start onboarding
          </Link>
        </div>
      </section>
    </>
  );
}
