import { StatusBadge } from "@/components/StatusBadge";
import { Card, Eyebrow } from "@/components/ui";
import { getOperation } from "@/lib/api";
import Link from "next/link";

type Params = Promise<{ id: string }>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-caption-mono-sm text-mute">{label}</div>
      <div className="mt-1 text-body-md text-ink">{children}</div>
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
          <Link href="/operations" className="text-body-sm text-ink">
            â† Operations
          </Link>
        </p>
        <p className="my-4 text-body-md text-accent-sunset">Failed to load operation: {error}</p>
      </>
    );
  }

  return (
    <>
      <p>
        <Link href="/operations" className="text-body-sm text-ink">
          â† Operations
        </Link>
      </p>
      <Eyebrow className="mt-6 mb-3">Operation</Eyebrow>
      <h1 className="text-display-sm text-ink">Detail</h1>
      <p className="mt-2 font-mono text-body-sm text-mute">{op.operationId}</p>

      <Card className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Status">
          <StatusBadge status={op.status} />
        </Field>
        <Field label="Scope">
          <span className="font-mono text-body-sm">{op.scope}</span>
        </Field>
        <Field label="Key">
          <span className="font-mono text-body-sm">{op.key}</span>
        </Field>
        <Field label="Business key">
          <span className="font-mono text-body-sm">{op.businessKey || "â€”"}</span>
        </Field>
        <Field label="Fingerprint">
          <span className="break-all font-mono text-body-sm">{op.fingerprint}</span>
        </Field>
        <Field label="Request">
          <span className="font-mono text-body-sm">
            {op.requestMethod || "â€”"} {op.requestPath || ""}
          </span>
        </Field>
        <Field label="Created">{op.createdAt}</Field>
        <Field label="Updated">{op.updatedAt}</Field>
        <Field label="Lease expires">{op.leaseExpiresAt || "â€”"}</Field>
        <Field label="TTL / retain">
          {op.expiresAt} / {op.retainUntil}
        </Field>
        <Field label="Response status">{op.responseStatus ?? "â€”"}</Field>
        <Field label="Body stored">{op.responseBodyPresent ? "yes" : "no"}</Field>
      </Card>

      <Card className="mt-4">
        <h2 className="text-display-xs text-ink">Response body</h2>
        {op.responseBody != null ? (
          <pre className="mt-3 m-0 whitespace-pre-wrap font-mono text-body-sm text-body">
            {op.responseBody}
          </pre>
        ) : (
          <p className="mt-3 text-body-md text-mute">
            {op.responseBodyPresent
              ? "Body is stored but redacted (expose-response-body=false)."
              : "No response body stored."}
          </p>
        )}
      </Card>
    </>
  );
}
