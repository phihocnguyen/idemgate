"use client";

/** Clamp 0–1 */
export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Map scroll progress through a window. */
export function progressInView(scrollY: number, start: number, end: number) {
  if (end <= start) return 0;
  return clamp01((scrollY - start) / (end - start));
}

/**
 * Lid hinge angle in degrees for CSS rotateX.
 * Closed (0): ~90° — lid flat on keyboard, back facing camera.
 * Open (1): ~−18° — screen facing viewer, slight recline.
 */
export function lidAngleDeg(progress: number) {
  const p = clamp01(progress);
  const e = 1 - Math.pow(1 - p, 2.4);
  return 90 - e * 108;
}

/** Screen content fades in once the lid is past ~30% open. */
export function screenOpacity(progress: number) {
  return clamp01((clamp01(progress) - 0.28) / 0.45);
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
