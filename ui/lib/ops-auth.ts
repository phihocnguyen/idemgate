export const OPS_COOKIE = "idemgate_ops";

export function opsCredentials() {
  return {
    user: process.env.OPS_USER || process.env.NEXT_PUBLIC_OPS_USER || "admin",
    pass: process.env.OPS_PASSWORD || process.env.NEXT_PUBLIC_OPS_PASSWORD || "admin",
  };
}
