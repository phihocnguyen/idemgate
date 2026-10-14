"use client";

import { useEffect, useState } from "react";
import { areaPath, smoothPath } from "@/lib/landing/chart";
import { chartSeries, metrics, successRate } from "@/lib/landing/data";

const W = 560;
const H = 160;

export function DashboardScreen({ animate = false }: { animate?: boolean }) {
  const line = smoothPath(chartSeries, W, H);
  const area = areaPath(line, W, H);
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = c * successRate;
  const [on, setOn] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    setOn(false);
    const t = window.setTimeout(() => setOn(true), 60);
    return () => clearTimeout(t);
  }, [animate]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0b0d]">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#121216] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex-1 truncate rounded-sm bg-black/40 px-3 py-1 text-[10px] text-mute">
          ops.idemgate.dev / overview
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-auto p-3 sm:grid-cols-[1.4fr_0.8fr]">
        <div className="min-h-0">
          <p className="mb-2 text-[9px] tracking-[0.14em] text-mute uppercase">Throughput</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id="ig-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a17" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ff7a17" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={area}
              fill="url(#ig-area)"
              className={on ? "mac-chart-fill" : "opacity-0"}
            />
            <path
              d={line}
              fill="none"
              stroke="#ff7a17"
              strokeWidth="2.2"
              strokeLinecap="round"
              className={on ? "mac-chart-stroke" : "opacity-0"}
              pathLength={1}
            />
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map((m, i) => (
              <div
                key={m.id}
                className={["border border-white/5 bg-white/[0.02] px-2 py-2", on ? "mac-line mac-line-on" : "opacity-0"].join(" ")}
                style={{ ["--i" as string]: i }}
              >
                <p className="text-[9px] tracking-wider text-mute uppercase">{m.label}</p>
                <p className="mt-0.5 font-mono text-sm text-ink">{m.value}</p>
                <p className={m.positive ? "text-[10px] text-emerald-400" : "text-[10px] text-red-400"}>
                  {m.delta}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] p-4">
          <p className="mb-3 text-[9px] tracking-[0.14em] text-mute uppercase">Success rate</p>
          <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden>
            <circle cx="55" cy="55" r={r} fill="none" stroke="#212327" strokeWidth="8" />
            <circle
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke="#ff7a17"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={on ? `${dash} ${c - dash}` : `0 ${c}`}
              style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1)" }}
              transform="rotate(-90 55 55)"
            />
            <text
              x="55"
              y="58"
              textAnchor="middle"
              className="fill-ink"
              fontSize="18"
              fontFamily="ui-monospace, monospace"
            >
              {(successRate * 100).toFixed(1)}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
