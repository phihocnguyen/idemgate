import { ButtonOutline, Container, NavLink } from "@/components/ui";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="relative z-20 border-b border-hairline/60 bg-canvas/80 px-6 py-4 backdrop-blur-sm">
        <Container className="flex items-center justify-between gap-4">
          <Link href="/" className="text-body-sm text-ink hover:no-underline">
            IdemGate
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink href="/">Demo</NavLink>
            <NavLink href="/integrate">Integrate</NavLink>
            <NavLink href="/operations">Dashboard</NavLink>
            <ButtonOutline href="/integrate" size="sm">
              Start
            </ButtonOutline>
          </nav>
        </Container>
      </header>
      {children}
    </div>
  );
}
