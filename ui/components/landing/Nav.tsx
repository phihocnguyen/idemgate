"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/lib/landing/data";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        solid ? "border-b border-hairline bg-canvas/85 backdrop-blur-md" : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <Container className="flex h-14 items-center justify-between gap-6">
        <a href="#" className="font-mono text-[13px] tracking-[0.2em] text-ink uppercase">
          IdemGate
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-body-sm text-body transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/bench" variant="outline" className="hidden sm:inline-flex">
            Live bench
          </Button>
          <Button href="#cta">Get started</Button>
        </div>
      </Container>
    </header>
  );
}
