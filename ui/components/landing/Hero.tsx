"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeviceStage } from "@/components/device/DeviceStage";

export function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-28 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(255,122,23,0.16),transparent_55%),radial-gradient(ellipse_50%_40%_at_85%_55%,rgba(13,23,38,0.85),transparent_65%),linear-gradient(180deg,#0a0a0a_0%,#0c1018_50%,#0a0a0a_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas to-transparent"
      />

      <Container className="relative z-10">
        <div className={["mx-auto max-w-3xl text-center", "reveal", ready ? "reveal-on" : ""].join(" ")}>
          <p className="font-mono text-xs tracking-[0.28em] text-accent-sunset uppercase">Postgres idempotency</p>
          <p className="mt-5 text-display-lg text-ink md:text-display-xl">IdemGate</p>
          <h1 className="mt-5 text-display-sm text-ink md:mt-6 md:text-display-md">
            Charge once. Retry forever.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-body-lg text-body">
            A claim registry in front of your side effects — payments, webhooks, and jobs never double-fire.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href="#product">See how it works</Button>
            <Button href="/bench" variant="outline">
              Open live bench
            </Button>
          </div>
        </div>

        <div
          className={["relative mt-14 md:mt-20", "reveal", ready ? "reveal-on" : ""].join(" ")}
          style={{ ["--reveal-delay" as string]: "160ms" }}
        >
          <DeviceStage progress={0.9} autoplay />
        </div>
      </Container>
    </section>
  );
}
