import { useEffect, useState } from "react";
import { getSettings, listOperations } from "../lib/api";

type Counts = Record<string, number>;

export function StatusPage() {
  const [counts, setCounts] = useState<Counts>({});
  const [scopes, setScopes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ts, setTs] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [settings, all] = await Promise.all([
          getSettings(),
          listOperations({ limit: "1", offset: "0" }),
        ]);
        setScopes(settings.scopes);
        const statuses = ["COMPLETED", "IN_PROGRESS", "UNKNOWN", "FAILED"];
        const next: Counts = { TOTAL: all.total };
        await Promise.all(
          statuses.map(async (s) => {
            const p = await listOperations({ status: s, limit: "1", offset: "0" });
            next[s] = p.total;
          }),
        );
        setCounts(next);
        setTs(new Date().toLocaleString());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, []);

  return (
    <>
      <h1>Status</h1>
      <p className="lead">Registry snapshot — similar to Prometheus runtime status pages.</p>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="panel">
        <h2>Build / runtime</h2>
        <div className="dl">
          <div className="dl-row">
            <dt>Console</dt>
            <dd>IdemGate Ops (embedded)</dd>
          </div>
          <div className="dl-row">
            <dt>Admin API</dt>
            <dd>/v1/admin/**</dd>
          </div>
          <div className="dl-row">
            <dt>Refreshed</dt>
            <dd>{ts || "…"}</dd>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Operation counts</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {["TOTAL", "COMPLETED", "IN_PROGRESS", "UNKNOWN", "FAILED"].map((k) => (
              <tr key={k}>
                <td className="mono">{k}</td>
                <td className="mono">{counts[k] ?? "…"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Scopes</h2>
        {scopes.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>None yet.</p>
        ) : (
          <ul className="mono" style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {scopes.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
