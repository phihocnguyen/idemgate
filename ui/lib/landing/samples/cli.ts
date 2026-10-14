import type { CliBlock } from "../types";

export const cliBlocks: CliBlock[] = [
  {
    id: "claim",
    prompt: "idemgate",
    lines: [
      { kind: "in", text: "curl -X POST $IDEMGATE/v1/claims \\" },
      { kind: "in", text: '  -H "Idempotency-Key: pay_42" \\' },
      { kind: "in", text: '  -d \'{"amount":1999}\'' },
      { kind: "ok", text: "← 201 claimed  fingerprint=a3f9…  ttl=24h" },
    ],
  },
  {
    id: "replay",
    prompt: "retry",
    lines: [
      { kind: "in", text: "# same key + body" },
      { kind: "out", text: "← 200 replay  cached response restored" },
      { kind: "ok", text: "your API was not called" },
    ],
  },
  {
    id: "race",
    prompt: "race",
    lines: [
      { kind: "in", text: "# 3 concurrent requests, one key" },
      { kind: "ok", text: "← 201 claimed" },
      { kind: "err", text: "← 409 conflict ×2" },
      { kind: "out", text: "exactly one charge landed" },
    ],
  },
];
