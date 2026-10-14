import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSettings, patchSettings, type AdminSettings } from "../lib/api";

export function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setSettings(await getSettings());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      setSettings(
        await patchSettings({
          retentionDays: settings.retentionDays,
          defaultTtlSeconds: settings.defaultTtlSeconds,
          defaultLeaseSeconds: settings.defaultLeaseSeconds,
          maxResponseBodyBytes: settings.maxResponseBodyBytes,
          exposeResponseBody: settings.exposeResponseBody,
        }),
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (error && !settings) return <div className="alert alert-error">{error}</div>;
  if (!settings) return <p className="lead">Loading…</p>;

  return (
    <>
      <h1>Configuration</h1>
      <p className="lead">
        Retention, lease/TTL defaults, and response-body policy. Scopes (namespaces) are discovered from live
        operations.
      </p>

      <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 520 }}>
        <h2>Runtime knobs</h2>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label className="field">
            Retention (days)
            <input
              type="number"
              min={1}
              max={3650}
              value={settings.retentionDays}
              onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            Default TTL (seconds)
            <input
              type="number"
              min={1}
              max={86400}
              value={settings.defaultTtlSeconds}
              onChange={(e) => setSettings({ ...settings, defaultTtlSeconds: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            Default lease (seconds)
            <input
              type="number"
              min={1}
              max={86400}
              value={settings.defaultLeaseSeconds}
              onChange={(e) => setSettings({ ...settings, defaultLeaseSeconds: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            Max response body (bytes)
            <input
              type="number"
              min={0}
              max={10485760}
              value={settings.maxResponseBodyBytes}
              onChange={(e) => setSettings({ ...settings, maxResponseBodyBytes: Number(e.target.value) })}
            />
            <span style={{ fontSize: 12 }}>Set 0 to avoid storing bodies.</span>
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={settings.exposeResponseBody}
              onChange={(e) => setSettings({ ...settings, exposeResponseBody: e.target.checked })}
            />
            <span>
              <strong>Expose response body in admin detail</strong>
              <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 12 }}>
                Off by default. Bodies may contain PII — enable only for trusted operators.
              </div>
            </span>
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {saved ? <div className="alert alert-ok">Saved for this process.</div> : null}

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>

      <div className="panel">
        <h2>Namespaces (scopes)</h2>
        <p className="lead" style={{ marginBottom: "0.75rem" }}>
          Distinct scopes seen in the registry. Click to filter Operations.
        </p>
        {settings.scopes.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>No scopes yet — run a claim to populate.</p>
        ) : (
          <div className="scopes">
            {settings.scopes.map((s) => (
              <Link key={s} to={`/?scope=${encodeURIComponent(s)}`}>
                {s}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
