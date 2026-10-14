"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Device, type DeviceScreen } from "./Device";
import { CodeEditor } from "./CodeEditor";
import { DashboardScreen } from "./DashboardScreen";
import { TerminalScreen } from "./TerminalScreen";

const TABS: { id: DeviceScreen; label: string }[] = [
  { id: "code", label: "Editor" },
  { id: "ops", label: "Ops" },
  { id: "cli", label: "CLI" },
];

type Props = {
  progress?: number;
  autoplay?: boolean;
  className?: string;
};

export function DeviceStage({ progress, autoplay = false, className = "" }: Props) {
  const [screen, setScreen] = useState<DeviceScreen>("code");
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState(false);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const busy = useRef(false);

  const switchTo = useCallback((next: DeviceScreen) => {
    if (busy.current || next === screenRef.current) return;
    busy.current = true;
    setPhase("out");
    window.setTimeout(() => {
      setScreen(next);
      setTick((t) => t + 1);
      setPhase("in");
      busy.current = false;
    }, 200);
  }, []);

  useEffect(() => {
    if (!autoplay || hovered) return;
    const id = window.setInterval(() => {
      const order: DeviceScreen[] = ["code", "ops", "cli"];
      const i = order.indexOf(screenRef.current);
      switchTo(order[(i + 1) % order.length]!);
    }, 5200);
    return () => clearInterval(id);
  }, [autoplay, hovered, switchTo]);

  const onKeyAction = useCallback(
    (action: "code" | "ops" | "cli" | "cycle") => {
      if (action === "cycle") {
        const order: DeviceScreen[] = ["code", "ops", "cli"];
        const i = order.indexOf(screenRef.current);
        switchTo(order[(i + 1) % order.length]!);
        return;
      }
      switchTo(action);
    },
    [switchTo],
  );

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTo(t.id)}
            className={[
              "rounded-pill border px-4 py-1.5 text-button-md transition-all duration-300",
              screen === t.id && phase === "in"
                ? "border-primary bg-primary text-on-primary shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                : "border-hairline bg-transparent text-body hover:border-body-mid hover:text-ink",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Device progress={progress} interactive activeScreen={screen} onKeyAction={onKeyAction}>
        <div className={phase === "out" ? "mac-screen mac-screen-out" : "mac-screen mac-screen-in"} key={tick}>
          {screen === "code" ? <CodeEditor /> : null}
          {screen === "ops" ? <DashboardScreen animate /> : null}
          {screen === "cli" ? <TerminalScreen animate /> : null}
        </div>
      </Device>

    </div>
  );
}
