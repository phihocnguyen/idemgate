import { StatusBadge } from "@/components/StatusBadge";
import { Eyebrow } from "@/components/ui";
import { listOperations } from "@/lib/api";
import Link from "next/link";

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
  "rounded-sm border border-hairline bg-canvas-soft px-4 py-3 text-body-md text-ink outline-none focus:border-white/40";
const labelCls = "flex flex-col gap-2 text-caption-mono-sm text-mute";

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
      <Eyebrow className="mb-3">Dashboard</Eyebrow>
      <h1 className="text-display-sm text-ink">Operations</h1>
      <p className="mt-2 text-body-md text-body">
        Search and inspect idempotency records from the registry.
      </p>

      <form className="mt-6 mb-6 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 rounded-sm border border-hairline bg-canvas-card p-6">
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
            className="min-h-11 cursor-pointer rounded-pill border border-primary bg-primary px-3 py-1 text-button-md text-on-primary"
          >
            Apply
          </button>
        </label>
      </form>

      {error && <p className="my-4 text-body-md text-accent-sunset">Failed to load operations: {error}</p>}

      {!error && page && (
        <div className="overflow-x-auto rounded-sm border border-hairline bg-canvas-card">
          <div className="border-b border-hairline px-6 py-3 text-body-sm text-mute">
            {page.total} total · showing {page.items.length} (offset {page.offset})
          </div>
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="bg-canvas-soft">
                {["Status", "Scope / Key", "Path", "Updated", ""].map((h) => (
                  <th
                    key={h || "x"}
                    className="border-b border-hairline px-4 py-3 text-left text-caption-mono text-ink"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="border-b border-hairline px-4 py-3 text-mute">
                    No operations matched.
                  </td>
                </tr>
              )}
              {page.items.map((op) => (
                <tr key={op.operationId}>
                  <td className="border-b border-hairline px-4 py-3 align-top">
                    <StatusBadge status={op.status} />
                  </td>
                  <td className="border-b border-hairline px-4 py-3 align-top">
                    <div className="font-mono">{op.scope}</div>
                    <div className="font-mono text-mute">{op.key}</div>
                  </td>
                  <td className="border-b border-hairline px-4 py-3 align-top font-mono">
                    {op.requestMethod || "—"} {op.requestPath || ""}
                  </td>
                  <td className="border-b border-hairline px-4 py-3 align-top text-mute">
                    {op.updatedAt}
                  </td>
                  <td className="border-b border-hairline px-4 py-3 align-top">
                    <Link
                      href={`/operations/${op.operationId}`}
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 px-6 py-3">
            {Number(offset) > 0 && (
              <Link
                href={opsQuery({
                  ...base,
                  offset: String(Math.max(0, Number(offset) - Number(limit))),
                })}
                className="text-body-sm text-ink"
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
                className="text-body-sm text-ink"
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
