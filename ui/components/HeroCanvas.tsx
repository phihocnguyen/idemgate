"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-canvas" aria-hidden />,
});

export function HeroCanvas() {
  return <HeroScene />;
}
