"use client";

import { useEffect, useState } from "react";
import { codeSamples } from "@/lib/landing/data";
import { highlightLine, tokenClass } from "@/lib/landing/syntax";

export function CodeEditor() {
  const [active, setActive] = useState(0);
  const [swap, setSwap] = useState(false);
  const sample = codeSamples[active] ?? codeSamples[0]!;

  useEffect(() => {
    setSwap(true);
    const t = window.setTimeout(() => setSwap(false), 40);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0b0d] text-[12px] leading-[1.65] text-body">
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-9 shrink-0 flex-col items-center gap-3.5 border-r border-white/[0.06] bg-[#08080a] py-3 sm:flex">
          {["◆", "≡", "⌕"].map((g) => (
            <span key={g} className="text-[9px] text-mute/70 transition-colors hover:text-ink">
              {g}
            </span>
          ))}
        </aside>
        <aside className="hidden w-32 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c0f] px-2.5 py-3 md:flex">
          <p className="mb-2.5 text-[9px] tracking-[0.16em] text-mute uppercase">Explorer</p>
          {codeSamples.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={[
                "truncate pl-2 text-left text-[11px] transition-colors duration-200",
                i === active ? "text-accent-sunset-soft" : "text-mute hover:text-body",
              ].join(" ")}
            >
              {s.filename}
            </button>
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b border-white/[0.06] bg-[#101014]">
            {codeSamples.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                className={[
                  "relative border-r border-white/[0.06] px-3.5 py-2 text-[11px] tracking-wide transition-colors duration-200",
                  i === active ? "bg-[#0b0b0d] text-ink" : "text-mute hover:text-body",
                ].join(" ")}
              >
                {s.filename}
                {i === active ? (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-accent-sunset" />
                ) : null}
              </button>
            ))}
          </div>

          <div
            key={sample.id}
            className={["min-h-0 flex-1 overflow-auto px-3 py-3.5 font-mono", swap ? "opacity-0" : "mac-code-in"].join(" ")}
          >
            {sample.lines.map((line, idx) => (
              <div
                key={idx}
                className="mac-line mac-line-on flex gap-3.5"
                style={{ ["--i" as string]: idx }}
              >
                <span className="w-5 shrink-0 select-none text-right text-[11px] text-mute/45">{idx + 1}</span>
                <code className="min-w-0 whitespace-pre">
                  {highlightLine(line).map((tok, j) => (
                    <span key={j} className={tokenClass[tok.t]}>
                      {tok.v}
                    </span>
                  ))}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-white/[0.06] bg-[#101014] px-3 py-1.5 text-[9px] tracking-[0.12em] text-mute uppercase">
        <span className="transition-colors duration-300">{sample.label}</span>
        <span>UTF-8 · LF · IdemGate</span>
      </footer>
    </div>
  );
}
