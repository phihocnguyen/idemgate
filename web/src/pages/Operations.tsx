import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listOperations, type AdminOperation, type AdminPage } from "../lib/api";
import { fmt, shortId } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";

const STATUSES = ["", "COMPLETED", "IN_PROGRESS", "UNKNOWN", "FAILED"];

export function OperationsPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("");
  const [scope, setScope] = useState("");
  const [key, setKey] = useState("");
  const [operationId, setOperationId] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<AdminPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [status, scope, key, operationId, q, from, to, offset]);

  useEffect(() => {
    const s = params.get("scope");
    if (s) setScope(s);
  }, [params]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOffset(0);
    void load();
  };

  const items: AdminOperation[] = page?.items ?? [];
  const total = page?.total ?? 0;

  return (
    <>
      <h1>Operations</h1>
      <p className="lead">Search the idempotency registry by key, id, scope, status, and time range.</p>

      <form className="panel" onSubmit={onSubmit}>
        <h2>Query</h2>
        <div className="grid-filters">
          <label className="field" style={{ gridColumn: "span 2" }}>
            Search (q)
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="key, path, id…" />
          </label>
          <label className="field">
            Idempotency key
            <input className="mono" value={key} onChange={(e) => setKey(e.target.value)} />
          </label>
          <label className="field">
            Operation ID
            <input className="mono" value={operationId} onChange={(e) => setOperationId(e.target.value)} />
          </label>
          <label className="field">
            Scope / namespace
            <input className="mono" value={scope} onChange={(e) => setScope(e.target.value)} placeholder="payments" />
          </label>
          <label className="field">
            Status
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setOffset(0);
              }}
            >
              {STATUSES.map((s) => (
                <option key={s || "all"} value={s}>
                  {s || "All"}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            From
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            To
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <div className="actions" style={{ marginTop: "0.85rem" }}>
          <button type="submit" className="btn btn-primary">
            Execute
          </button>
          <button
            type="button"
            className="btn"
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
          >
            Reset
          </button>
          <span style={{ color: "var(--muted)", marginLeft: "auto" }}>
            {loading ? "Loading…" : `${total} series`}
          </span>
        </div>
      </form>

      {error ? (
        <div className="alert alert-error">
          <strong>Cannot query admin API.</strong>
          <div style={{ marginTop: 6 }}>{error}</div>
        </div>
      ) : null}

      <table className="data">
        <thead>
          <tr>
            <th>Status</th>
            <th>Scope</th>
            <th>Key</th>
            <th>Operation</th>
            <th>Created</th>
            <th>Completed</th>
            <th>Body</th>
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                No operations matched.
              </td>
            </tr>
          ) : null}
          {items.map((op) => (
            <tr key={op.operationId}>
              <td>
                <StatusBadge status={op.status} />
              </td>
              <td className="mono">{op.scope}</td>
              <td className="mono" title={op.key}>
                {op.key.length > 28 ? `${op.key.slice(0, 28)}…` : op.key}
              </td>
              <td>
                <Link className="mono" to={`/operations/${op.operationId}`} title={op.operationId}>
                  {shortId(op.operationId)}
                </Link>
              </td>
              <td className="mono">{fmt(op.createdAt)}</td>
              <td className="mono">{fmt(op.completedAt)}</td>
              <td>{op.responseBodyPresent ? <span style={{ color: "var(--warn)" }}>stored</span> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pager">
        <button type="button" className="btn" disabled={offset <= 0 || loading} onClick={() => setOffset((o) => Math.max(0, o - limit))}>
          Newer
        </button>
        <span>
          {total === 0 ? "0" : `${offset + 1}–${Math.min(offset + limit, total)}`} / {total}
        </span>
        <button
          type="button"
          className="btn"
          disabled={loading || offset + limit >= total}
          onClick={() => setOffset((o) => o + limit)}
        >
          Older
        </button>
      </div>
    </>
  );
}
