import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOperation, type AdminOperation } from "../lib/api";
import { fmt } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dl-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function OperationDetailPage() {
  const { id = "" } = useParams();
  const [op, setOp] = useState<AdminOperation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getOperation(id);
        if (!cancelled) setOp(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <>
        <p>
          <Link to="/">← Operations</Link>
        </p>
        <div className="alert alert-error">{error}</div>
      </>
    );
  }

  if (!op) return <p className="lead">Loading…</p>;

  return (
    <>
      <p>
        <Link to="/">← Operations</Link>
      </p>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Operation</h1>
        <StatusBadge status={op.status} />
      </div>
      <p className="lead mono">{op.operationId}</p>

      <div className="dl" style={{ marginBottom: "1rem" }}>
        <Row label="Scope">{op.scope}</Row>
        <Row label="Idempotency key">{op.key}</Row>
        <Row label="Fingerprint">{op.fingerprint}</Row>
        <Row label="Business key">{op.businessKey || "—"}</Row>
        <Row label="Request">{[op.requestMethod, op.requestPath].filter(Boolean).join(" ") || "—"}</Row>
        <Row label="HTTP response">{op.responseStatus ?? "—"}</Row>
        <Row label="Created">{fmt(op.createdAt)}</Row>
        <Row label="Updated">{fmt(op.updatedAt)}</Row>
        <Row label="Completed">{fmt(op.completedAt)}</Row>
        <Row label="Lease expires">{fmt(op.leaseExpiresAt)}</Row>
        <Row label="Expires">{fmt(op.expiresAt)}</Row>
        <Row label="Retain until">{fmt(op.retainUntil)}</Row>
        <Row label="Body stored">{op.responseBodyPresent ? "yes" : "no"}</Row>
      </div>

      <div className="panel">
        <h2>Response body</h2>
        {op.responseBody ? (
          <pre className="body">{op.responseBody}</pre>
        ) : (
          <div className="alert alert-info" style={{ margin: 0 }}>
            {op.responseBodyPresent
              ? "A body is stored on the server, but exposeResponseBody is false. Enable under Configuration only if acceptable."
              : "No response body was stored for this operation."}
          </div>
        )}
      </div>
    </>
  );
}
