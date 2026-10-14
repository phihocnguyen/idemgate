"use client";

import { useState } from "react";
import type { AdminSettings } from "@/lib/api";
import { patchSettings } from "@/lib/api";

const field =
  "rounded-sm border border-hairline bg-canvas-soft px-4 py-3 text-body-md text-ink outline-none focus:border-white/40";
const labelCls = "flex flex-col gap-2 text-caption-mono-sm text-mute";

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
    <form
      className="mt-6 max-w-lg rounded-sm border border-hairline bg-canvas-card p-6"
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Retention days
          <input
            type="number"
            min={1}
            className={field}
            value={form.retentionDays}
            onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })}
          />
        </label>
        <label className={labelCls}>
          Default TTL (sec)
          <input
            type="number"
            min={1}
            className={field}
            value={form.defaultTtlSeconds}
            onChange={(e) => setForm({ ...form, defaultTtlSeconds: Number(e.target.value) })}
          />
        </label>
        <label className={labelCls}>
          Default lease (sec)
          <input
            type="number"
            min={1}
            className={field}
            value={form.defaultLeaseSeconds}
            onChange={(e) => setForm({ ...form, defaultLeaseSeconds: Number(e.target.value) })}
          />
        </label>
        <label className={labelCls}>
          Max response body (bytes)
          <input
            type="number"
            min={0}
            className={field}
            value={form.maxResponseBodyBytes}
            onChange={(e) => setForm({ ...form, maxResponseBodyBytes: Number(e.target.value) })}
          />
        </label>
      </div>

      <label className="mt-6 flex flex-row items-center gap-2 text-body-sm text-body">
        <input
          type="checkbox"
          checked={form.exposeResponseBody}
          onChange={(e) => setForm({ ...form, exposeResponseBody: e.target.checked })}
        />
        Expose response body in admin API
      </label>

      <div className="mt-6">
        <div className="text-caption-mono-sm text-mute">Known scopes</div>
        <div className="mt-1 font-mono text-body-sm text-ink">
          {form.scopes.length ? form.scopes.join(", ") : "(none yet)"}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 cursor-pointer rounded-pill border border-primary bg-primary px-3 py-1 text-button-md text-on-primary disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="text-body-sm text-mute">{msg}</span>}
        {err && <span className="text-body-sm text-accent-sunset">{err}</span>}
      </div>
    </form>
  );
}
