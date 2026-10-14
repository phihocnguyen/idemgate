import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt">
      <header className="mkt-nav">
        <Link href="/" className="mkt-brand">
          IdemGate
        </Link>
        <nav className="mkt-nav-links">
          <Link href="/integrate">Integrate</Link>
          <Link href="/operations">Dashboard</Link>
          <Link href="/integrate" className="btn btn-primary">
            Start
          </Link>
        </nav>
      </header>
      {children}
      <footer className="mkt-footer">
        <span>IdemGate — idempotency registry, not a business proxy.</span>
        <Link href="/operations">Open dashboard</Link>
      </footer>
    </div>
  );
}
