export type NavLink = { href: string; label: string };

export type Feature = {
  id: string;
  title: string;
  body: string;
  accent: "sunset" | "breeze" | "twilight";
};

export type LogRow = {
  id: string;
  method: string;
  path: string;
  status: number;
  note: string;
  tone: "ok" | "warn" | "err" | "mute";
};

export type Metric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

export type ChartPoint = { t: number; v: number };

export type CodeSample = {
  id: string;
  label: string;
  language: "ts" | "go" | "bash";
  filename: string;
  lines: string[];
};

export type CliBlock = {
  id: string;
  prompt: string;
  lines: { kind: "in" | "out" | "ok" | "err"; text: string }[];
};

export type SyntaxToken =
  | { t: "plain"; v: string }
  | { t: "kw"; v: string }
  | { t: "str"; v: string }
  | { t: "num"; v: string }
  | { t: "cmt"; v: string }
  | { t: "fn"; v: string }
  | { t: "op"; v: string };
