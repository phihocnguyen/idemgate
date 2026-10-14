import type { SyntaxToken } from "./types";

const KW =
  /\b(import|from|export|async|function|return|const|let|var|new|package|func|error|any|string|int64|Context)\b/g;
const STR = /("[^"]*"|'[^']*'|`[^`]*`)/g;
const NUM = /\b\d+\b/g;
const CMT = /(\/\/.*$)/;
const FN = /\b([A-Za-z_][\w]*)\s*(?=\()/g;

/** Lightweight highlighter for demo snippets (not a full parser). */
export function highlightLine(line: string): SyntaxToken[] {
  if (!line) return [{ t: "plain", v: " " }];

  const cmt = line.match(CMT);
  if (cmt && cmt.index === 0) return [{ t: "cmt", v: line }];

  const out: SyntaxToken[] = [];
  const push = (t: SyntaxToken["t"], v: string) => {
    if (!v) return;
    out.push({ t, v });
  };

  // Split by strings first
  const parts: { kind: "str" | "raw"; v: string }[] = [];
  let last = 0;
  for (const m of line.matchAll(STR)) {
    if (m.index! > last) parts.push({ kind: "raw", v: line.slice(last, m.index) });
    parts.push({ kind: "str", v: m[0] });
    last = m.index! + m[0].length;
  }
  if (last < line.length) parts.push({ kind: "raw", v: line.slice(last) });
  if (parts.length === 0) parts.push({ kind: "raw", v: line });

  for (const p of parts) {
    if (p.kind === "str") {
      push("str", p.v);
      continue;
    }
    let chunk = p.v;
    // comments at end
    const ci = chunk.search(CMT);
    let tail = "";
    if (ci >= 0) {
      tail = chunk.slice(ci);
      chunk = chunk.slice(0, ci);
    }

    const re = new RegExp(`${KW.source}|${FN.source}|${NUM.source}|([{}()\\[\\].,;=<>!:?+\\-*/&|%]+)`, "g");
    let m: RegExpExecArray | null;
    let cursor = 0;
    while ((m = re.exec(chunk))) {
      if (m.index > cursor) push("plain", chunk.slice(cursor, m.index));
      const tok = m[0];
      if (/^\d+$/.test(tok)) push("num", tok);
      else if (/^[{}()[\].,;=<>!:?+\-*/&|%]+$/.test(tok)) push("op", tok);
      else if (
        /^(import|from|export|async|function|return|const|let|var|new|package|func|error|any|string|int64|Context)$/.test(
          tok,
        )
      ) {
        push("kw", tok);
      } else push("fn", tok);
      cursor = m.index + tok.length;
    }
    if (cursor < chunk.length) push("plain", chunk.slice(cursor));
    if (tail) push("cmt", tail);
  }

  return out.length ? out : [{ t: "plain", v: line }];
}

export const tokenClass: Record<SyntaxToken["t"], string> = {
  plain: "text-body",
  kw: "text-accent-breeze",
  str: "text-accent-sunset-soft",
  num: "text-accent-twilight",
  cmt: "text-mute",
  fn: "text-ink",
  op: "text-body-mid",
};
