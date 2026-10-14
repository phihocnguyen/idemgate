"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSettings, patchSettings, type AdminSettings } from "@/lib/api";

export function SettingsPanel() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setSettings(await getSettings());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settings");
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
      const next = await patchSettings({
        retentionDays: settings.retentionDays,
        defaultTtlSeconds: settings.defaultTtlSeconds,
        defaultLeaseSeconds: settings.defaultLeaseSeconds,
        maxResponseBodyBytes: settings.maxResponseBodyBytes,
        exposeResponseBody: settings.exposeResponseBody,
      });
      setSettings(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (error && !settings) {
    return <p className="text-red-400">{error}</p>;
  }
  if (!settings) {
    return <p className="text-mute">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-caption-mono text-mute">Configuration</p>
        <h1 className="mt-2 text-display-sm text-ink">Settings</h1>
        <p className="mt-2 max-w-2xl text-body-md text-body">
          Retention, lease/TTL defaults, and response-body policy. Namespaces (scopes) are listed from live
          operations — they are not free-form created here.
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-xl space-y-5 border border-hairline bg-canvas-soft/20 p-5">
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Retention (days)</span>
          <input
            type="number"
            min={1}
            max={3650}
            value={settings.retentionDays}
            onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Default TTL (seconds)</span>
          <input
            type="number"
            min={1}
            max={86400}
            value={settings.defaultTtlSeconds}
            onChange={(e) => setSettings({ ...settings, defaultTtlSeconds: Number(e.target.value) })}
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Default lease (seconds)</span>
          <input
            type="number"
            min={1}
            max={86400}
            value={settings.defaultLeaseSeconds}
            onChange={(e) => setSettings({ ...settings, defaultLeaseSeconds: Number(e.target.value) })}
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-caption-mono-sm text-mute">Max response body (bytes)</span>
          <input
            type="number"
            min={0}
            max={10485760}
            value={settings.maxResponseBodyBytes}
            onChange={(e) => setSettings({ ...settings, maxResponseBodyBytes: Number(e.target.value) })}
            className="w-full border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm outline-none focus:border-body-mid"
          />
          <span className="mt-1 block text-body-sm text-mute">Set 0 to avoid storing bodies.</span>
        </label>

        <label className="flex items-start gap-3 border border-hairline p-3">
          <input
            type="checkbox"
            checked={settings.exposeResponseBody}
            onChange={(e) => setSettings({ ...settings, exposeResponseBody: e.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="block text-body-md text-ink">Expose response body in admin detail</span>
            <span className="mt-1 block text-body-sm text-mute">
              Off by default. Bodies may contain PII or secrets — only enable for trusted operators.
            </span>
          </span>
        </label>

        {error ? <p className="text-body-sm text-red-400">{error}</p> : null}
        {saved ? <p className="text-body-sm text-emerald-400">Saved for this process.</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-pill border border-primary bg-primary px-5 py-2.5 text-button-md text-on-primary disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
      </form>

      <section className="border border-hairline p-5">
        <h2 className="text-caption-mono-sm text-mute">Namespaces (scopes)</h2>
        <p className="mt-2 text-body-sm text-body">
          Distinct scopes seen in the registry. Filter Operations by these values.
        </p>
        {settings.scopes.length === 0 ? (
          <p className="mt-4 text-mute">No scopes yet — run a claim to populate.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {settings.scopes.map((s) => (
              <li key={s}>
                <a
                  href={`/ops?scope=${encodeURIComponent(s)}`}
                  className="border border-hairline px-3 py-1.5 font-mono text-body-sm text-body hover:border-body-mid hover:text-ink"
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
