"use client";

import { useState } from "react";
import type { AdminSettings } from "@/lib/api";
import { patchSettings } from "@/lib/api";

const field =
  "rounded-lg border border-app-line bg-[#10161e] px-2.5 py-2 text-app-text outline-none focus:border-app-accent";
const labelCls = "flex flex-col gap-1.5 text-xs text-app-muted";

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
      className="mt-4 max-w-lg rounded-xl border border-app-line bg-app-panel/90 p-4"
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-5">
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

      <label className="mt-4 flex flex-row items-center gap-2 text-sm text-app-muted">
        <input
          type="checkbox"
          checked={form.exposeResponseBody}
          onChange={(e) => setForm({ ...form, exposeResponseBody: e.target.checked })}
        />
        Expose response body in admin API
      </label>

      <div className="mt-4">
        <div className="mb-1 text-app-muted">Known scopes</div>
        <div className="font-mono text-sm">
          {form.scopes.length ? form.scopes.join(", ") : "(none yet)"}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-lg border-transparent bg-app-accent px-3 py-2 font-semibold text-[#041018] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="text-app-muted">{msg}</span>}
        {err && <span className="text-app-bad">{err}</span>}
      </div>
    </form>
  );
}
