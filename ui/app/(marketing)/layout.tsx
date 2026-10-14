import { ButtonOutline, Container, NavLink } from "@/components/ui";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas px-6 py-3">
        <Container className="flex items-center justify-between gap-4">
          <Link href="/" className="text-body-sm text-ink hover:no-underline">
            IdemGate
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink href="/integrate">Integrate</NavLink>
            <NavLink href="/operations">Dashboard</NavLink>
            <ButtonOutline href="/integrate" size="sm">
              Start
            </ButtonOutline>
          </nav>
        </Container>
      </header>
      {children}
      <footer className="border-t border-hairline bg-canvas px-6 py-12 text-body-sm text-body">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <span>IdemGate — idempotency registry, not a business proxy.</span>
          <NavLink href="/operations" className="text-body">
            Open dashboard
          </NavLink>
        </Container>
      </footer>
    </div>
  );
}
