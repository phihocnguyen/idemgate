"use client";

import dynamic from "next/dynamic";

const ClaimBench = dynamic(() => import("@/components/ClaimBench").then((m) => m.ClaimBench), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-canvas" />,
});

/** Interactive Three.js claim / replay bench. */
export default function BenchPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-canvas">
      <a
        href="/"
        className="absolute top-4 left-4 z-20 font-mono text-xs tracking-[0.14em] text-mute uppercase hover:text-ink"
      >
        ← IdemGate
      </a>
      <ClaimBench />
    </main>
  );
}
