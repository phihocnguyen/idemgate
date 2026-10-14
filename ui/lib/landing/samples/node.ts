import type { CodeSample } from "../types";

export const nodeSample: CodeSample = {
  id: "node",
  label: "Node.js",
  language: "ts",
  filename: "charge.ts",
  lines: [
    'import { IdemGate } from "@idemgate/sdk";',
    "",
    "const gate = new IdemGate({",
    '  baseUrl: process.env.IDEMGATE_URL!,',
    '  apiKey: process.env.IDEMGATE_KEY!,',
    "});",
    "",
    "export async function charge(orderId: string, amount: number) {",
    "  const key = `pay_${orderId}`;",
    "  const body = { amount, currency: \"usd\" };",
    "",
    "  // Claim → forward once → cache response",
    "  return gate.run(key, body, async () => {",
    "    return stripe.charges.create(body);",
    "  });",
    "}",
  ],
};
