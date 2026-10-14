"use client";

import { useRef, useState, type MouseEvent } from "react";
import { features } from "@/lib/landing/data";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const marks = {
  sunset: (
    <svg viewBox="0 0 40 40" className="size-9 text-accent-sunset" aria-hidden>
      <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  ),
  breeze: (
    <svg viewBox="0 0 40 40" className="size-9 text-accent-breeze" aria-hidden>
      <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.35" />
    </svg>
  ),
  twilight: (
    <svg viewBox="0 0 40 40" className="size-9 text-accent-twilight" aria-hidden>
      <rect x="6" y="6" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6 20 H34 M20 6 V34" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    </svg>
  ),
} as const;

const glow = {
  sunset: "rgba(255,122,23,0.14)",
  breeze: "rgba(160,195,236,0.12)",
  twilight: "rgba(196,181,253,0.12)",
} as const;

function FeatureCard({
  title,
  body,
  accent,
  delay,
}: {
  title: string;
  body: string;
  accent: keyof typeof marks;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 40, y: 30, on: false });

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    });
  };

  return (
    <Reveal delay={delay}>
      <article
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setSpot((s) => ({ ...s, on: false }))}
        className="relative border-t border-hairline pt-7 pb-2 transition-colors"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -mx-3 rounded-sm transition-opacity duration-300"
          style={{
            opacity: spot.on ? 1 : 0,
            background: `radial-gradient(320px circle at ${spot.x}% ${spot.y}%, ${glow[accent]}, transparent 60%)`,
          }}
        />
        <div className="relative mb-5">{marks[accent]}</div>
        <h3 className="relative text-display-xs text-ink">{title}</h3>
        <p className="relative mt-3 max-w-sm text-body-md text-body">{body}</p>
      </article>
    </Reveal>
  );
}

export function Features() {
  return (
    <Section id="features" eyebrow="Capabilities" title="The whole claim lifecycle.">
      <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <FeatureCard key={f.id} title={f.title} body={f.body} accent={f.accent} delay={i * 50} />
        ))}
      </div>
    </Section>
  );
}
