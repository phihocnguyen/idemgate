import { HeroCanvas } from "@/components/HeroCanvas";
import { ButtonOutline, ButtonPrimary, Container, Eyebrow } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IdemGate",
  description: "Interactive before/after demo of the IdemGate claim loop",
};

export default function LandingPage() {
  return (
    <section className="relative isolate min-h-[calc(100vh-57px)] overflow-hidden bg-canvas">
      <HeroCanvas />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 bg-gradient-to-b from-canvas via-canvas/60 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-44 bg-gradient-to-t from-canvas via-canvas/75 to-transparent"
        aria-hidden
      />

      <Container className="relative z-10 flex flex-col items-center px-6 pb-4 pt-8 text-center">
        <Eyebrow className="mb-3">Interactive bench</Eyebrow>
        <h1 className="max-w-3xl text-display-sm text-ink md:text-display-md">
          Before vs after IdemGate
        </h1>
        <p className="mt-3 max-w-xl text-body-md text-body">
          Click the computer screen. Switch <span className="text-ink">BEFORE</span> /{" "}
          <span className="text-ink">AFTER</span>, then PAY → RETRY → RACE.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonPrimary href="/integrate">Integration guide</ButtonPrimary>
          <ButtonOutline href="/operations">Open dashboard</ButtonOutline>
        </div>
      </Container>

      <div className="pointer-events-none relative z-0 h-[min(68vh,720px)]" aria-hidden />
    </section>
  );
}
