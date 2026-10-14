"use client";

import { useEffect, useState } from "react";
import { cliBlocks } from "@/lib/landing/data";

export function TerminalScreen({ animate = true }: { animate?: boolean }) {
  const [visible, setVisible] = useState(animate ? 0 : 99);

  useEffect(() => {
    if (!animate) return;
    setVisible(0);
    const timers: number[] = [];
    let n = 0;
    const block = cliBlocks[0]!;
    const tick = () => {
      n += 1;
      setVisible(n);
      if (n < block.lines.length) {
        timers.push(window.setTimeout(tick, 380));
      }
    };
    timers.push(window.setTimeout(tick, 280));
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const block = cliBlocks[0]!;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#070709] font-mono text-[12px] leading-relaxed">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#101014] px-3 py-2">
        <span className="size-2 rounded-full bg-[#ff5f57]/90" />
        <span className="size-2 rounded-full bg-[#febc2e]/90" />
        <span className="size-2 rounded-full bg-[#28c840]/90" />
        <span className="ml-2 text-[10px] tracking-wider text-mute uppercase">zsh — idemgate</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="mb-3 text-mute">
          <span className="text-accent-sunset">➜</span> ~ claim a payment key
        </p>
        {block.lines.map((l, i) => (
          <div
            key={i}
            className={[
              "mac-line",
              i < visible ? "mac-line-on" : "",
              l.kind === "in" ? "text-body" : "",
              l.kind === "ok" ? "text-emerald-400" : "",
              l.kind === "err" ? "text-red-400" : "",
              l.kind === "out" ? "text-accent-breeze" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ ["--i" as string]: i }}
          >
            {l.text}
          </div>
        ))}
        {visible >= block.lines.length ? (
          <p className="mt-3 text-mute">
            <span className="text-accent-sunset">➜</span> <span className="mac-caret" />
          </p>
        ) : null}
      </div>
    </div>
  );
}
