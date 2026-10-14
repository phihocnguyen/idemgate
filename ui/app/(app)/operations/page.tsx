import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listOperations } from "@/lib/api";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function opsQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `/operations?${s}` : "/operations";
}

const field =
  "rounded-lg border border-app-line bg-[#10161e] px-2.5 py-2 text-app-text outline-none focus:border-app-accent";
const labelCls = "flex flex-col gap-1.5 text-xs text-app-muted";

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

  const base = { status, scope, key, businessKey, q, limit };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
      <p className="mt-1 text-app-muted">Search and inspect idempotency records from the registry.</p>

      <form className="mt-4 mb-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 rounded-xl border border-app-line bg-app-panel/90 p-4">
        <label className={labelCls}>
          Status
          <select name="status" defaultValue={status || ""} className={field}>
            <option value="">Any</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </label>
        <label className={labelCls}>
          Scope
          <input name="scope" defaultValue={scope || ""} placeholder="payments" className={field} />
        </label>
        <label className={labelCls}>
          Key
          <input name="key" defaultValue={key || ""} placeholder="exact key" className={field} />
        </label>
        <label className={labelCls}>
          Business key
          <input name="businessKey" defaultValue={businessKey || ""} className={field} />
        </label>
        <label className={labelCls}>
          Search
          <input name="q" defaultValue={q || ""} placeholder="key / path / id" className={field} />
        </label>
        <label className={labelCls}>
          &nbsp;
          <button
            type="submit"
            className="cursor-pointer rounded-lg border-transparent bg-app-accent px-2.5 py-2 font-semibold text-[#041018]"
          >
            Apply
          </button>
        </label>
      </form>

      {error && <p className="my-4 text-app-bad">Failed to load operations: {error}</p>}

      {!error && page && (
        <div className="rounded-xl border border-app-line bg-app-panel/90 p-4">
          <p className="mb-3 text-app-muted">
            {page.total} total · showing {page.items.length} (offset {page.offset})
          </p>
          <table className="w-full border-collapse text-[0.92rem]">
            <thead>
              <tr>
                {["Status", "Scope / Key", "Path", "Updated", ""].map((h) => (
                  <th
                    key={h || "x"}
                    className="border-b border-app-line px-1.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-app-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="border-b border-app-line px-1.5 py-2.5 text-app-muted">
                    No operations matched.
                  </td>
                </tr>
              )}
              {page.items.map((op) => (
                <tr key={op.operationId}>
                  <td className="border-b border-app-line px-1.5 py-2.5 align-top">
                    <StatusBadge status={op.status} />
                  </td>
                  <td className="border-b border-app-line px-1.5 py-2.5 align-top">
                    <div className="font-mono text-sm">{op.scope}</div>
                    <div className="font-mono text-sm text-app-muted">{op.key}</div>
                  </td>
                  <td className="border-b border-app-line px-1.5 py-2.5 align-top font-mono text-sm">
                    {op.requestMethod || "—"} {op.requestPath || ""}
                  </td>
                  <td className="border-b border-app-line px-1.5 py-2.5 align-top text-app-muted">
                    {op.updatedAt}
                  </td>
                  <td className="border-b border-app-line px-1.5 py-2.5 align-top">
                    <Link href={`/operations/${op.operationId}`} className="text-app-accent">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-3">
            {Number(offset) > 0 && (
              <Link
                href={opsQuery({
                  ...base,
                  offset: String(Math.max(0, Number(offset) - Number(limit))),
                })}
                className="text-app-accent"
              >
                ← Prev
              </Link>
            )}
            {page.offset + page.items.length < page.total && (
              <Link
                href={opsQuery({
                  ...base,
                  offset: String(Number(offset) + Number(limit)),
                })}
                className="text-app-accent"
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
