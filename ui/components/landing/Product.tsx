"use client";

import { DeviceStage } from "@/components/device/DeviceStage";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Product() {
  return (
    <Section id="product" eyebrow="In your editor" title="Drop a key. Keep the receipt.">
      <Reveal>
        <p className="mb-10 max-w-2xl text-body-lg text-body md:mb-12">
          Same claim → run once → cache shape in Node and Go. Switch Editor · Ops · CLI to see the path.
        </p>
      </Reveal>

      <div data-device-runway className="relative h-[240vh]">
        <div className="sticky top-[4.5rem] flex min-h-[calc(100vh-5.5rem)] items-center py-6">
          <DeviceStage />
        </div>
      </div>
    </Section>
  );
}
