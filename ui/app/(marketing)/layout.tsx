import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(31,122,76,0.12),transparent_60%),linear-gradient(180deg,#f5f7f3_0%,var(--color-paper)_40%,#e8ece6_100%)] text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="font-display text-xl font-bold tracking-tight hover:no-underline">
          IdemGate
        </Link>
        <nav className="flex items-center gap-5 text-[0.95rem]">
          <Link href="/integrate">Integrate</Link>
          <Link href="/operations">Dashboard</Link>
          <Link
            href="/integrate"
            className="inline-flex items-center rounded-md bg-signal px-[1.15rem] py-[0.7rem] text-[0.95rem] font-semibold text-[#f4faf6] transition hover:-translate-y-px hover:bg-signal-deep hover:no-underline"
          >
            Start
          </Link>
        </nav>
      </header>
      {children}
      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-line px-6 py-6 text-sm text-muted">
        <span>IdemGate — idempotency registry, not a business proxy.</span>
        <Link href="/operations">Open dashboard</Link>
      </footer>
    </div>
  );
}
