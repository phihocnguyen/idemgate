import type { ChartPoint, Feature, LogRow, Metric, NavLink } from "./types";
import { cliBlocks } from "./samples/cli";
import { goSample } from "./samples/go";
import { nodeSample } from "./samples/node";

export const navLinks: NavLink[] = [
  { href: "#problem", label: "Problem" },
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#dashboard", label: "Ops" },
  { href: "/bench", label: "Live bench" },
];

export const features: Feature[] = [
  {
    id: "claim",
    title: "Claim once",
    body: "First request wins the key. Concurrent twins get 409 — your charge path runs exactly once.",
    accent: "sunset",
  },
  {
    id: "replay",
    title: "Replay safely",
    body: "Same key + same body returns the cached response. Retries stop being double charges.",
    accent: "breeze",
  },
  {
    id: "mismatch",
    title: "Catch tampering",
    body: "Same key with a different payload fails closed with 422. Keys stay bound to intent.",
    accent: "twilight",
  },
  {
    id: "heartbeat",
    title: "Survive slow work",
    body: "In-flight leases heartbeat so long Stripe or bank calls do not expire mid-flight.",
    accent: "sunset",
  },
  {
    id: "postgres",
    title: "Postgres-native",
    body: "Your registry lives next to the data you already trust — no exotic broker required.",
    accent: "breeze",
  },
  {
    id: "ops",
    title: "Ops you can see",
    body: "Claims, replays, conflicts, and mismatches surface as first-class signals in the dashboard.",
    accent: "twilight",
  },
];

export const withoutGate: LogRow[] = [
  { id: "a1", method: "POST", path: "/charge", status: 201, note: "charged $19.99", tone: "ok" },
  { id: "a2", method: "POST", path: "/charge", status: 201, note: "charged $19.99 again", tone: "err" },
  { id: "a3", method: "POST", path: "/charge", status: 201, note: "timeout retry → third hit", tone: "err" },
];

export const withGate: LogRow[] = [
  { id: "b1", method: "POST", path: "/charge", status: 201, note: "claimed → charged once", tone: "ok" },
  { id: "b2", method: "POST", path: "/charge", status: 200, note: "replay · API skipped", tone: "ok" },
  { id: "b3", method: "POST", path: "/charge", status: 409, note: "race loser held", tone: "warn" },
];

export const metrics: Metric[] = [
  { id: "m1", label: "Claims", value: "12,480", delta: "+8.2%", positive: true },
  { id: "m2", label: "Replays", value: "3,104", delta: "+12%", positive: true },
  { id: "m3", label: "Conflicts", value: "218", delta: "−4.1%", positive: true },
  { id: "m4", label: "Mismatches", value: "31", delta: "+2", positive: false },
];

/** Smooth-ish series for the ops chart (normalized 0–1). */
export const chartSeries: ChartPoint[] = [
  { t: 0, v: 0.32 },
  { t: 1, v: 0.38 },
  { t: 2, v: 0.35 },
  { t: 3, v: 0.52 },
  { t: 4, v: 0.48 },
  { t: 5, v: 0.61 },
  { t: 6, v: 0.58 },
  { t: 7, v: 0.72 },
  { t: 8, v: 0.69 },
  { t: 9, v: 0.81 },
  { t: 10, v: 0.78 },
  { t: 11, v: 0.9 },
];

export const successRate = 0.984;

export const codeSamples = [nodeSample, goSample];
export { cliBlocks };

export const logos = ["Stripe shops", "Fintech APIs", "Marketplace checkouts", "Billing jobs", "Webhook fans"];
