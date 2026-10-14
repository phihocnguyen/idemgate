"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-canvas" />,
});

/** Root page: interactive IdemGate computer only. */
export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-canvas">
      <HeroScene placement="center" />
    </main>
  );
}
