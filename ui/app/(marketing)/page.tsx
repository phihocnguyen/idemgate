import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IdemGate",
  description: "Claim once. Replay safely. A PostgreSQL-backed idempotency registry.",
};

const btnPrimary =
  "inline-flex items-center rounded-md bg-signal px-[1.15rem] py-[0.7rem] text-[0.95rem] font-semibold text-[#f4faf6] transition hover:-translate-y-px hover:bg-signal-deep hover:no-underline";
const btnGhost =
  "inline-flex items-center rounded-md border border-line bg-transparent px-[1.15rem] py-[0.7rem] text-[0.95rem] font-semibold text-ink transition hover:-translate-y-px hover:no-underline";

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl grid-rows-[auto_1fr] px-6">
        <div className="motion-safe-rise max-w-lg animate-[rise_700ms_ease_both] py-6 pb-7">
          <p className="font-display text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">
            IdemGate
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.35rem,2.6vw,1.85rem)] font-semibold leading-snug tracking-tight">
            Safe retries for side-effecting APIs.
          </h1>
          <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed text-muted">
            A PostgreSQL registry that claims work once, leases ownership, and replays the stored
            outcome when clients double-submit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/integrate" className={btnPrimary}>
              Integration guide
            </Link>
            <Link href="/operations" className={btnGhost}>
              Open dashboard
            </Link>
          </div>
        </div>

        <div
          className="motion-safe-fade relative mx-[-1.5rem] min-h-[42vh] overflow-hidden bg-[linear-gradient(120deg,#101814_0%,#1a2a22_55%,#0f1c16_100%)] text-[#dce8e1] animate-[fade-in_900ms_ease_120ms_both]"
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_47px,rgba(255,255,255,0.03)_48px),repeating-linear-gradient(0deg,transparent_0,transparent_47px,rgba(255,255,255,0.03)_48px)]" />
          <div className="motion-safe-sweep absolute inset-x-0 bottom-[28%] h-0.5 bg-[linear-gradient(90deg,transparent,var(--color-signal),transparent)] opacity-70 animate-[sweep_4.5s_ease-in-out_infinite]" />
          <div className="relative z-10 mx-auto h-full max-w-6xl px-6 py-7 pb-9">
            <div className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[#8aa394]">
              Registry · live operations
            </div>
            <div className="grid gap-2.5">
              <RegistryRow
                delay="200ms"
                status="COMPLETED"
                statusClass="border-[#5dcf93] text-[#5dcf93]"
                keyLabel="payments / ord_1842:charge"
                meta="replay ready"
              />
              <RegistryRow
                delay="360ms"
                status="IN_PROGRESS"
                statusClass="border-[#e0b44f] text-[#e0b44f]"
                keyLabel="webhooks / evt_9f3a:deliver"
                meta="lease 42s"
              />
              <RegistryRow
                delay="520ms"
                status="UNKNOWN"
                statusClass="border-[#e07a72] text-[#e07a72]"
                keyLabel="transfers / tx_77:settle"
                meta="reconcile"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-[4.5rem]">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] tracking-tight">
          A registry, not a proxy
        </h2>
        <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-muted">
          IdemGate stores claim identity, fingerprint, lease, and response snapshot. Your service
          still runs the business logic — the gate decides whether to execute or replay.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-[4.5rem] pt-0">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] tracking-tight">The claim loop</h2>
        <p className="mt-3 mb-8 max-w-xl text-[1.05rem] leading-relaxed text-muted">
          Three calls. One owner. Deterministic retries.
        </p>
        <div className="grid border-y border-line md:grid-cols-3">
          <FlowStep n="01" title="Claim">
            Atomic insert on scope + key. Winner receives an owner token and lease.
          </FlowStep>
          <FlowStep n="02" title="Work" border>
            Only the owner executes. Heartbeat extends the lease for long jobs.
          </FlowStep>
          <FlowStep n="03" title="Complete" last>
            Store status + response. Later claims with the same key get a replay.
          </FlowStep>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-5 border-t border-line py-8">
          <div>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] tracking-tight">
              Wire it in under an hour
            </h2>
            <p className="mt-2 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              HTTP API, Java SDK, or Spring `@Idempotent` — pick a path and verify in the dashboard.
            </p>
          </div>
          <Link href="/integrate" className={btnPrimary}>
            Start onboarding
          </Link>
        </div>
      </section>
    </>
  );
}

function RegistryRow({
  delay,
  status,
  statusClass,
  keyLabel,
  meta,
}: {
  delay: string;
  status: string;
  statusClass: string;
  keyLabel: string;
  meta: string;
}) {
  return (
    <div
      className="motion-safe-slide grid items-center gap-2 border border-[rgba(140,180,155,0.22)] bg-[rgba(8,16,12,0.55)] px-4 py-3 font-mono text-[0.82rem] animate-[slide-in_650ms_ease_both] md:grid-cols-[7.5rem_1fr_auto] md:gap-4"
      style={{ animationDelay: delay }}
    >
      <span className={`inline-block border px-1.5 py-0.5 text-[0.72rem] font-bold tracking-wide ${statusClass}`}>
        {status}
      </span>
      <span className="truncate text-[#b7cfc2]">{keyLabel}</span>
      <span className="whitespace-nowrap text-[#7f9789]">{meta}</span>
    </div>
  );
}

function FlowStep({
  n,
  title,
  children,
  border,
  last,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
  border?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`border-line py-5 md:py-6 md:pr-5 ${
        last ? "" : "border-b md:border-b-0 md:border-r"
      } ${border || last ? "md:pl-5" : "md:pr-5"} first:md:pl-0`}
    >
      <div className="mb-2 font-mono text-xs tracking-wider text-signal">{n}</div>
      <h3 className="mb-1.5 font-display text-lg tracking-tight">{title}</h3>
      <p className="m-0 text-[0.98rem] leading-relaxed text-muted">{children}</p>
    </div>
  );
}
