import { Suspense } from "react";
import { OperationsPanel } from "@/components/ops/OperationsPanel";

export default function OpsHomePage() {
  return (
    <Suspense fallback={<p className="text-mute">Loading…</p>}>
      <OperationsPanel />
    </Suspense>
  );
}
