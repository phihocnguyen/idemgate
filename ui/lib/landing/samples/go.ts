import type { CodeSample } from "../types";

export const goSample: CodeSample = {
  id: "go",
  label: "Go",
  language: "go",
  filename: "charge.go",
  lines: [
    "package payments",
    "",
    'import "github.com/idemgate/sdk-go"',
    "",
    "func Charge(ctx context.Context, orderID string, amount int64) error {",
    '  key := "pay_" + orderID',
    "  body := ChargeBody{Amount: amount, Currency: \"usd\"}",
    "",
    "  return gate.Run(ctx, key, body, func() (any, error) {",
    "    return stripe.NewCharge(body)",
    "  })",
    "}",
  ],
};
