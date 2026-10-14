import { cookies } from "next/headers";
import { OpsShell } from "@/components/ops/OpsShell";
import { OPS_COOKIE } from "@/lib/ops-auth";

export const metadata = {
  title: "IdemGate Ops",
  description: "Operations dashboard for the IdemGate registry",
};

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const authed = jar.get(OPS_COOKIE)?.value === "1";

  // Login page renders without the ops chrome.
  // Nested layouts still wrap all /ops/* — detect via cookie + client path is awkward;
  // use a thin wrapper: OpsShell only when cookie present. Login has no cookie.
  if (!authed) {
    return children;
  }
  return <OpsShell>{children}</OpsShell>;
}
