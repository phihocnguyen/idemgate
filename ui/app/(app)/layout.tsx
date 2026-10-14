import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Inspect idempotency operations and runtime settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-main">
        <nav className="app-nav">
          <Link href="/" className="app-brand">
            IdemGate
          </Link>
          <Link href="/operations">Operations</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/integrate">Integrate</Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
