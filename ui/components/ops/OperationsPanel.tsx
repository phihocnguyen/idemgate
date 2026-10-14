"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { listOperations, type AdminOperation, type AdminPage } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";

const STATUSES = ["", "COMPLETED", "IN_PROGRESS", "UNKNOWN", "FAILED"] as const;

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export function OperationsPanel() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("");
  const [scope, setScope] = useState(() => searchParams.get("scope") || "");
  const [key, setKey] = useState("");
  const [operationId, setOperationId] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState<AdminPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOperations({
        status: status || undefined,
        scope: scope || undefined,
        key: key || undefined,
        operationId: operationId || undefined,
        q: q || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
        limit: String(limit),
        offset: String(offset),
      });
      setPage(data);
    } catch (e) {
      setPage(null);
      setError(e instanceof Error ? e.message : "Failed to load operations");
    } finally {
      setLoading(false);
    }
  }, [status, scope, key, operationId, q, from, to, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setOffset(0);
    void load();
  };

  const items: AdminOperation[] = page?.items ?? [];
  const total = page?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-caption-mono text-mute">Registry</p>
        <h1 className="mt-2 text-display-sm text-ink">Operations</h1>
        <p className="mt-2 max-w-2xl text-body-md text-body">
          Search claims by key, operation ID, scope, and time. Response bodies stay redacted unless enabled in
          Settings.
        </p>
      </div>

      <form onSubmit={onSearch} className="grid gap-3 border border-hairline bg-canvas-soft/30 p-4 md:grid-cols-4">
        <label className="block md:col-span-2">
          <span className="mb-1 block text-caption-mono-sm text-mute">Search (q)</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="key, path, id…"
            className="w-full border border-hairline bg-canvas px-3 py-2 text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Idempotency key</span>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Operation ID</span>
          <input
            value={operationId}
            onChange={(e) => setOperationId(e.target.value)}
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Scope / namespace</span>
          <input
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="payments"
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setOffset(0);
            }}
            className="w-full border border-hairline bg-canvas px-3 py-2 text-body-sm outline-none focus:border-body-mid"
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All"}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">From</span>
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-hairline bg-canvas px-3 py-2 text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">To</span>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-hairline bg-canvas px-3 py-2 text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <div className="flex items-end gap-2 md:col-span-4">
          <button
            type="submit"
            className="rounded-pill border border-primary bg-primary px-5 py-2 text-button-md text-on-primary"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setScope("");
              setKey("");
              setOperationId("");
              setQ("");
              setFrom("");
              setTo("");
              setOffset(0);
            }}
            className="rounded-pill border border-hairline px-5 py-2 text-button-md text-body hover:text-ink"
          >
            Reset
          </button>
          <p className="ml-auto self-center text-body-sm text-mute">
            {loading ? "Loading…" : `${total} result${total === 1 ? "" : "s"}`}
          </p>
        </div>
      </form>

      {error ? (
        <div className="border border-red-400/30 bg-red-400/5 px-4 py-3 text-body-sm text-red-300">
          <p className="font-medium text-red-200">Cannot reach admin API</p>
          <p className="mt-1 text-red-300/80">{error}</p>
          <p className="mt-2 text-mute">
            Start the server and set{" "}
            <code className="text-body">NEXT_PUBLIC_IDEMGATE_URL</code> /{" "}
            <code className="text-body">NEXT_PUBLIC_IDEMGATE_API_KEY</code>.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto border border-hairline">
        <table className="w-full min-w-[720px] border-collapse text-left text-body-sm">
          <thead className="border-b border-hairline bg-canvas-soft/50">
            <tr className="text-caption-mono-sm text-mute">
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Scope</th>
              <th className="px-4 py-3 font-normal">Key</th>
              <th className="px-4 py-3 font-normal">Operation</th>
              <th className="px-4 py-3 font-normal">Created</th>
              <th className="px-4 py-3 font-normal">Body</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mute">
                  No operations match these filters.
                </td>
              </tr>
            ) : null}
            {items.map((op) => (
              <tr key={op.operationId} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <StatusBadge status={op.status} />
                </td>
                <td className="px-4 py-3 font-mono text-body">{op.scope}</td>
                <td className="max-w-[14rem] truncate px-4 py-3 font-mono text-body" title={op.key}>
                  {op.key}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/ops/operations/${op.operationId}`}
                    className="font-mono text-accent-breeze hover:text-ink"
                    title={op.operationId}
                  >
                    {shortId(op.operationId)}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-mute">{fmt(op.createdAt)}</td>
                <td className="px-4 py-3 text-mute">
                  {op.responseBodyPresent ? (
                    <span className="text-amber-300/90">stored</span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={offset <= 0 || loading}
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
          className="border border-hairline px-4 py-2 text-button-md text-body disabled:opacity-40"
        >
          Previous
        </button>
        <p className="text-body-sm text-mute">
          {offset + 1}–{Math.min(offset + limit, total)} of {total}
        </p>
        <button
          type="button"
          disabled={loading || offset + limit >= total}
          onClick={() => setOffset((o) => o + limit)}
          className="border border-hairline px-4 py-2 text-button-md text-body disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
