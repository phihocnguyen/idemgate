"use client";

import { useState } from "react";
import type { AdminSettings } from "@/lib/api";
import { patchSettings } from "@/lib/api";

export function SettingsForm({ initial }: { initial: AdminSettings }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const next = await patchSettings({
        retentionDays: form.retentionDays,
        defaultTtlSeconds: form.defaultTtlSeconds,
        defaultLeaseSeconds: form.defaultLeaseSeconds,
        maxResponseBodyBytes: form.maxResponseBodyBytes,
        exposeResponseBody: form.exposeResponseBody,
      });
      setForm(next);
      setMsg("Saved.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 520 }}>
      <div className="grid2">
        <label>
          Retention days
          <input
            type="number"
            min={1}
            value={form.retentionDays}
            onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })}
          />
        </label>
        <label>
          Default TTL (sec)
          <input
            type="number"
            min={1}
            value={form.defaultTtlSeconds}
            onChange={(e) => setForm({ ...form, defaultTtlSeconds: Number(e.target.value) })}
          />
        </label>
        <label>
          Default lease (sec)
          <input
            type="number"
            min={1}
            value={form.defaultLeaseSeconds}
            onChange={(e) => setForm({ ...form, defaultLeaseSeconds: Number(e.target.value) })}
          />
        </label>
        <label>
          Max response body (bytes)
          <input
            type="number"
            min={0}
            value={form.maxResponseBodyBytes}
            onChange={(e) => setForm({ ...form, maxResponseBodyBytes: Number(e.target.value) })}
          />
        </label>
      </div>

      <label style={{ marginTop: "1rem", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          checked={form.exposeResponseBody}
          onChange={(e) => setForm({ ...form, exposeResponseBody: e.target.checked })}
        />
        Expose response body in admin API
      </label>

      <div style={{ marginTop: "1rem" }}>
        <div className="muted" style={{ marginBottom: "0.35rem" }}>
          Known scopes
        </div>
        <div className="mono">{form.scopes.length ? form.scopes.join(", ") : "(none yet)"}</div>
      </div>

      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="muted">{msg}</span>}
        {err && <span className="error">{err}</span>}
      </div>
    </form>
  );
}
