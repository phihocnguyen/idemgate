import Link from "next/link";
import { listOperations } from "@/lib/api";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function OperationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = one(sp.status);
  const scope = one(sp.scope);
  const key = one(sp.key);
  const businessKey = one(sp.businessKey);
  const q = one(sp.q);
  const limit = one(sp.limit) || "50";
  const offset = one(sp.offset) || "0";

  let page;
  let error: string | null = null;
  try {
    page = await listOperations({ status, scope, key, businessKey, q, limit, offset });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <h1>Operations</h1>
      <p className="muted">Search and inspect idempotency records from the registry.</p>

      <form className="panel filters" method="get">
        <label>
          Status
          <select name="status" defaultValue={status || ""}>
            <option value="">Any</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </label>
        <label>
          Scope
          <input name="scope" defaultValue={scope || ""} placeholder="payments" />
        </label>
        <label>
          Key
          <input name="key" defaultValue={key || ""} placeholder="exact key" />
        </label>
        <label>
          Business key
          <input name="businessKey" defaultValue={businessKey || ""} />
        </label>
        <label>
          Search
          <input name="q" defaultValue={q || ""} placeholder="key / path / id" />
        </label>
        <label>
          &nbsp;
          <button type="submit">Apply</button>
        </label>
      </form>

      {error && <p className="error">Failed to load operations: {error}</p>}

      {!error && page && (
        <div className="panel">
          <p className="muted">
            {page.total} total · showing {page.items.length} (offset {page.offset})
          </p>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Scope / Key</th>
                <th>Path</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No operations matched.
                  </td>
                </tr>
              )}
              {page.items.map((op) => (
                <tr key={op.operationId}>
                  <td>
                    <span className={`badge ${op.status}`}>{op.status}</span>
                  </td>
                  <td>
                    <div className="mono">{op.scope}</div>
                    <div className="mono muted">{op.key}</div>
                  </td>
                  <td className="mono">
                    {op.requestMethod || "—"} {op.requestPath || ""}
                  </td>
                  <td className="muted">{op.updatedAt}</td>
                  <td>
                    <Link href={`/operations/${op.operationId}`}>Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            {Number(offset) > 0 && (
              <Link
                href={`/?${new URLSearchParams({
                  ...(status ? { status } : {}),
                  ...(scope ? { scope } : {}),
                  ...(key ? { key } : {}),
                  ...(businessKey ? { businessKey } : {}),
                  ...(q ? { q } : {}),
                  limit,
                  offset: String(Math.max(0, Number(offset) - Number(limit))),
                }).toString()}`}
              >
                ← Prev
              </Link>
            )}
            {page.offset + page.items.length < page.total && (
              <Link
                href={`/?${new URLSearchParams({
                  ...(status ? { status } : {}),
                  ...(scope ? { scope } : {}),
                  ...(key ? { key } : {}),
                  ...(businessKey ? { businessKey } : {}),
                  ...(q ? { q } : {}),
                  limit,
                  offset: String(Number(offset) + Number(limit)),
                }).toString()}`}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
