import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { getOperation } from "@/lib/api";

type Params = Promise<{ id: string }>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-app-muted">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default async function OperationDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  let op;
  let error: string | null = null;
  try {
    op = await getOperation(id);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !op) {
    return (
      <>
        <p>
          <Link href="/operations" className="text-app-accent">
            ← Operations
          </Link>
        </p>
        <p className="my-4 text-app-bad">Failed to load operation: {error}</p>
      </>
    );
  }

  return (
    <>
      <p>
        <Link href="/operations" className="text-app-accent">
          ← Operations
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Operation detail</h1>
      <p className="font-mono text-sm text-app-muted">{op.operationId}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-app-line bg-app-panel/90 p-4 sm:grid-cols-2 sm:gap-x-5">
        <Field label="Status">
          <StatusBadge status={op.status} />
        </Field>
        <Field label="Scope">
          <span className="font-mono text-sm">{op.scope}</span>
        </Field>
        <Field label="Key">
          <span className="font-mono text-sm">{op.key}</span>
        </Field>
        <Field label="Business key">
          <span className="font-mono text-sm">{op.businessKey || "—"}</span>
        </Field>
        <Field label="Fingerprint">
          <span className="font-mono text-sm break-all">{op.fingerprint}</span>
        </Field>
        <Field label="Request">
          <span className="font-mono text-sm">
            {op.requestMethod || "—"} {op.requestPath || ""}
          </span>
        </Field>
        <Field label="Created">{op.createdAt}</Field>
        <Field label="Updated">{op.updatedAt}</Field>
        <Field label="Lease expires">{op.leaseExpiresAt || "—"}</Field>
        <Field label="TTL / retain">
          {op.expiresAt} / {op.retainUntil}
        </Field>
        <Field label="Response status">{op.responseStatus ?? "—"}</Field>
        <Field label="Body stored">{op.responseBodyPresent ? "yes" : "no"}</Field>
      </div>

      <div className="mt-4 rounded-xl border border-app-line bg-app-panel/90 p-4">
        <h2 className="m-0 text-base font-semibold">Response body</h2>
        {op.responseBody != null ? (
          <pre className="m-0 mt-2 whitespace-pre-wrap font-mono text-sm">{op.responseBody}</pre>
        ) : (
          <p className="mt-2 text-app-muted">
            {op.responseBodyPresent
              ? "Body is stored but redacted (expose-response-body=false)."
              : "No response body stored."}
          </p>
        )}
      </div>
    </>
  );
}
