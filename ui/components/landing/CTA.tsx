import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(255,122,23,0.2),transparent_60%)]"
      />
      <Container className="relative text-center">
        <Reveal>
          <p className="text-caption-mono text-mute">Start here</p>
          <h2 className="mt-4 text-display-sm text-ink md:text-display-md">Put a gate on the charge.</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-body">
            Run the interactive bench, then wire the same claim → work → complete path into your API.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/bench">Open live bench</Button>
            <Button href="#product" variant="outline">
              Review the SDK shape
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
