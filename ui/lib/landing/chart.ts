import type { ChartPoint } from "./types";

/** Build a smooth SVG path (Catmull-Rom → cubic) for the ops sparkline. */
export function smoothPath(
  points: ChartPoint[],
  width: number,
  height: number,
  pad = 8,
): string {
  if (points.length < 2) return "";
  const maxT = points[points.length - 1]!.t;
  const coords = points.map((p) => ({
    x: pad + (p.t / maxT) * (width - pad * 2),
    y: pad + (1 - p.v) * (height - pad * 2),
  }));

  let d = `M ${coords[0]!.x.toFixed(1)} ${coords[0]!.y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] ?? coords[i]!;
    const p1 = coords[i]!;
    const p2 = coords[i + 1]!;
    const p3 = coords[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function areaPath(line: string, width: number, height: number, pad = 8): string {
  if (!line) return "";
  return `${line} L ${(width - pad).toFixed(1)} ${(height - pad).toFixed(1)} L ${pad} ${(height - pad).toFixed(1)} Z`;
}
