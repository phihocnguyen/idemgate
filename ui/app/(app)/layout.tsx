import { Container, NavLink } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Inspect idempotency operations and runtime settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas px-6 py-3">
        <Container className="flex flex-wrap items-center gap-6">
          <Link href="/" className="text-body-sm text-ink hover:no-underline">
            IdemGate
          </Link>
          <NavLink href="/operations">Operations</NavLink>
          <NavLink href="/settings">Settings</NavLink>
          <NavLink href="/integrate">Integrate</NavLink>
        </Container>
      </header>
      <main className="px-6 py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
