import Link from "next/link";
import { getOperation } from "@/lib/api";

type Params = Promise<{ id: string }>;

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
          <Link href="/operations">← Operations</Link>
        </p>
        <p className="error">Failed to load operation: {error}</p>
      </>
    );
  }

  return (
    <>
      <p>
        <Link href="/operations">← Operations</Link>
      </p>
      <h1>Operation detail</h1>
      <p className="mono muted">{op.operationId}</p>

      <div className="panel grid2" style={{ marginTop: "1rem" }}>
        <div>
          <div className="muted">Status</div>
          <div>
            <span className={`badge ${op.status}`}>{op.status}</span>
          </div>
        </div>
        <div>
          <div className="muted">Scope</div>
          <div className="mono">{op.scope}</div>
        </div>
        <div>
          <div className="muted">Key</div>
          <div className="mono">{op.key}</div>
        </div>
        <div>
          <div className="muted">Business key</div>
          <div className="mono">{op.businessKey || "—"}</div>
        </div>
        <div>
          <div className="muted">Fingerprint</div>
          <div className="mono">{op.fingerprint}</div>
        </div>
        <div>
          <div className="muted">Request</div>
          <div className="mono">
            {op.requestMethod || "—"} {op.requestPath || ""}
          </div>
        </div>
        <div>
          <div className="muted">Created</div>
          <div>{op.createdAt}</div>
        </div>
        <div>
          <div className="muted">Updated</div>
          <div>{op.updatedAt}</div>
        </div>
        <div>
          <div className="muted">Lease expires</div>
          <div>{op.leaseExpiresAt || "—"}</div>
        </div>
        <div>
          <div className="muted">TTL / retain</div>
          <div>
            {op.expiresAt} / {op.retainUntil}
          </div>
        </div>
        <div>
          <div className="muted">Response status</div>
          <div>{op.responseStatus ?? "—"}</div>
        </div>
        <div>
          <div className="muted">Body stored</div>
          <div>{op.responseBodyPresent ? "yes" : "no"}</div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Response body</h2>
        {op.responseBody != null ? (
          <pre className="mono" style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {op.responseBody}
          </pre>
        ) : (
          <p className="muted">
            {op.responseBodyPresent
              ? "Body is stored but redacted (expose-response-body=false)."
              : "No response body stored."}
          </p>
        )}
      </div>
    </>
  );
}
