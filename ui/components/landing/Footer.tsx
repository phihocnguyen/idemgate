import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-hairline py-12">
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="font-mono text-sm tracking-[0.18em] text-ink uppercase">IdemGate</p>
        <p className="text-body-sm text-mute">Postgres idempotency registry · claim · replay · conflict</p>
        <a href="/bench" className="text-body-sm text-body hover:text-ink">
          Live bench →
        </a>
      </Container>
    </footer>
  );
}
