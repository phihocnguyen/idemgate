"use client";

import { DeviceStage } from "@/components/device/DeviceStage";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Dashboard() {
  return (
    <Section id="dashboard" eyebrow="Operations" title="See claims, not just HTTP codes.">
      <Reveal>
        <p className="mb-10 max-w-2xl text-body-lg text-body md:mb-12">
          Throughput, replays, conflicts, and mismatches as first-class signals — switch to Ops on the machine
          above, or explore here.
        </p>
      </Reveal>
      <Reveal delay={80}>
        <DeviceStage progress={1} />
      </Reveal>
    </Section>
  );
}
