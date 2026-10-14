"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { clamp01, lidAngleDeg, screenOpacity } from "@/lib/landing/motion";

export type DeviceScreen = "code" | "ops" | "cli";

type Props = {
  progress?: number;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  activeScreen?: DeviceScreen;
  onKeyAction?: (action: "code" | "ops" | "cli" | "cycle") => void;
};

type KeySpec = {
  id: number;
  action?: "code" | "ops" | "cli" | "cycle";
  wide?: boolean;
};

const KEYS: KeySpec[] = Array.from({ length: 42 }, (_, i) => {
  const action =
    i === 0 ? "code" : i === 1 ? "ops" : i === 2 ? "cli" : i === 41 ? "cycle" : undefined;
  return { id: i, action, wide: i === 41 };
});

export function Device({
  progress: controlled,
  children,
  className = "",
  interactive = false,
  activeScreen,
  onKeyAction,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const lidEl = useRef<HTMLDivElement>(null);
  const sceneEl = useRef<HTMLDivElement>(null);
  const [self, setSelf] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [power, setPower] = useState(false);
  const [dragging, setDragging] = useState(false);

  const targetTilt = useRef({ x: 0, y: 0 });
  const curTilt = useRef({ x: 0, y: 0 });
  const targetLid = useRef(0);
  const curLid = useRef(90);
  const dragProgress = useRef<number | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(reduced);

    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      if (reduced) return;

      // Lerp tilt
      curTilt.current.x += (targetTilt.current.x - curTilt.current.x) * 0.12;
      curTilt.current.y += (targetTilt.current.y - curTilt.current.y) * 0.12;
      if (sceneEl.current) {
        sceneEl.current.style.transform = `rotateX(${curTilt.current.x.toFixed(3)}deg) rotateY(${curTilt.current.y.toFixed(3)}deg)`;
      }

      // Lerp lid
      const goal =
        dragProgress.current != null
          ? lidAngleDeg(dragProgress.current)
          : lidAngleDeg(targetLid.current);
      curLid.current += (goal - curLid.current) * 0.14;
      if (lidEl.current) {
        lidEl.current.style.transform = `rotateX(${curLid.current.toFixed(3)}deg)`;
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (controlled != null) {
      targetLid.current = reduced ? 1 : controlled;
      setSelf(controlled);
      if (reduced) curLid.current = lidAngleDeg(1);
      return;
    }

    const el = root.current;
    if (!el) return;
    const runway = el.closest("[data-device-runway]") as HTMLElement | null;

    const update = () => {
      if (reduced) {
        targetLid.current = 1;
        setSelf(1);
        return;
      }
      if (dragProgress.current != null) return;
      let p = 0;
      if (!runway) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        p = clamp01(1 - (r.top + r.height * 0.2) / (vh * 0.9));
      } else {
        const rect = runway.getBoundingClientRect();
        const travel = Math.max(1, runway.offsetHeight - window.innerHeight);
        p = clamp01(-rect.top / travel);
      }
      targetLid.current = p;
      setSelf(p);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [controlled]);

  const progress = reduce ? 1 : dragProgress.current ?? (controlled ?? self);
  const glow = screenOpacity(progress);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || dragging) return;
    const el = root.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    targetTilt.current = { x: ny * -7, y: nx * 10 };
  };

  const flashKey = useCallback((id: number) => {
    setLit(id);
    window.setTimeout(() => setLit(null), 220);
  }, []);

  const pressKey = (key: KeySpec) => {
    if (!interactive) return;
    flashKey(key.id);
    setPower(true);
    window.setTimeout(() => setPower(false), 400);
    if (key.action) onKeyAction?.(key.action);
  };

  // Drag lid open/close on the bezel notch area
  const onLidPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || reduce || controlled != null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragProgress.current = progress;
  };

  const onLidPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || dragProgress.current == null) return;
    const delta = -e.movementY / 220;
    dragProgress.current = clamp01(dragProgress.current + delta);
    setSelf(dragProgress.current);
  };

  const onLidPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragProgress.current != null) {
      targetLid.current = dragProgress.current;
    }
    dragProgress.current = null;
  };

  return (
    <div
      ref={root}
      className={`relative mx-auto w-full max-w-[52rem] select-none ${className}`}
      style={{ perspective: "1800px", perspectiveOrigin: "50% 38%" }}
      onMouseMove={onMove}
      onMouseLeave={() => {
        targetTilt.current = { x: 0, y: 0 };
      }}
    >
      <div
        ref={sceneEl}
        className="relative"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* LID */}
        <div
          ref={lidEl}
          className="relative z-20"
          style={{
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
            transform: `rotateX(${lidAngleDeg(progress)}deg)`,
            willChange: "transform",
          }}
          onPointerDown={onLidPointerDown}
          onPointerMove={onLidPointerMove}
          onPointerUp={onLidPointerUp}
          onPointerCancel={onLidPointerUp}
        >
          {/* Lid back */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-t-[1.1rem] bg-gradient-to-b from-[#3f3f46] via-[#2c2c32] to-[#1c1c22]"
            style={{ transform: "rotateX(180deg) translateZ(1px)", backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-x-[18%] top-[42%] h-px bg-white/10" />
            <p className="absolute inset-x-0 top-[48%] text-center font-mono text-[10px] tracking-[0.35em] text-white/20 uppercase">
              IdemGate
            </p>
          </div>

          {/* Lid front */}
          <div
            className="relative overflow-hidden rounded-t-[1.1rem] border border-white/12 bg-[#16161a] p-[1.4%] pb-[1%] shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
            style={{ backfaceVisibility: "hidden", transform: "translateZ(0.5px)" }}
          >
            <div className="mx-auto mb-1.5 flex h-3 cursor-grab items-center justify-center active:cursor-grabbing">
              <span
                className={[
                  "size-1.5 rounded-full ring-1 ring-white/15 transition-shadow duration-300",
                  power ? "bg-accent-sunset shadow-[0_0_10px_rgba(255,122,23,0.9)]" : "bg-[#0a0a0a]",
                ].join(" ")}
              />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[5px] bg-black ring-1 ring-white/5">
              <div
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{ opacity: glow, pointerEvents: glow > 0.35 ? "auto" : "none" }}
              >
                {children}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
                style={{ opacity: 1 - glow }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/[0.05]"
              />
              {/* Screen reflection that shifts with tilt */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen transition-transform duration-500"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.06) 48%, transparent 56%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Hinge */}
        <div className="relative z-10 h-2.5 bg-gradient-to-b from-[#4a4a52] via-[#2c2c32] to-[#1a1a1e]">
          <div className="absolute inset-x-[8%] top-0 h-px bg-white/15" />
        </div>

        {/* Base */}
        <div className="relative z-0 overflow-hidden rounded-b-[1rem] border border-t-0 border-white/10 bg-gradient-to-b from-[#2e2e34] to-[#141418] px-[7%] pt-2 pb-3 shadow-[0_36px_80px_rgba(0,0,0,0.55)]">
          <div className="mx-auto mb-2 h-2.5 max-w-[7.5rem] rounded-b-md bg-[#0c0c0e] shadow-inner" />

          {/* Interactive keyboard */}
          <div className="rounded-sm bg-[#0f0f12] p-1.5 ring-1 ring-black/40">
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
              {KEYS.map((key) => {
                const active =
                  (key.action === "code" && activeScreen === "code") ||
                  (key.action === "ops" && activeScreen === "ops") ||
                  (key.action === "cli" && activeScreen === "cli");
                return (
                  <button
                    key={key.id}
                    type="button"
                    aria-label={key.action ? `Switch to ${key.action}` : `Key ${key.id}`}
                    disabled={!interactive}
                    onClick={() => pressKey(key)}
                    className={[
                      "mac-key aspect-[1.15/1] rounded-[2px] ring-1 transition-all duration-150",
                      interactive ? "cursor-pointer hover:brightness-125 active:translate-y-[1px]" : "cursor-default",
                      lit === key.id || active
                        ? "bg-accent-sunset/35 ring-accent-sunset/50"
                        : "bg-[#1a1a20] ring-white/[0.04]",
                      key.wide ? "col-span-2" : "",
                    ].join(" ")}
                  />
                );
              })}
            </div>
          </div>

          {/* Trackpad */}
          <button
            type="button"
            disabled={!interactive}
            aria-label="Cycle screens"
            onClick={() => {
              if (!interactive) return;
              setPower(true);
              window.setTimeout(() => setPower(false), 350);
              onKeyAction?.("cycle");
            }}
            className={[
              "mx-auto mt-2 block h-10 w-[42%] rounded-[6px] border border-white/8 bg-[#121216] transition-all duration-200",
              interactive
                ? "cursor-pointer hover:border-white/20 hover:bg-[#18181c] active:scale-[0.98]"
                : "cursor-default",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}
