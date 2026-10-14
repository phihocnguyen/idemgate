import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Inspect idempotency operations and runtime settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,#1a2a3d,var(--color-app))] font-sans text-app-text">
      <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-8">
        <nav className="mb-8 flex items-baseline gap-4 border-b border-app-line pb-4">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-app-text hover:text-app-text hover:no-underline"
          >
            IdemGate
          </Link>
          <Link href="/operations" className="text-app-accent">
            Operations
          </Link>
          <Link href="/settings" className="text-app-accent">
            Settings
          </Link>
          <Link href="/integrate" className="text-app-accent">
            Integrate
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
