"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/ops/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }
      const next = search.get("next") || "/ops";
      router.replace(next.startsWith("/ops") ? next : "/ops");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-sm border border-hairline bg-canvas-soft/40 p-8">
      <p className="font-mono text-[12px] tracking-[0.2em] text-mute uppercase">IdemGate</p>
      <h1 className="mt-3 text-display-xs text-ink">Ops console</h1>
      <p className="mt-2 text-body-sm text-body">Sign in to inspect claims and retention settings.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-caption-mono-sm text-mute">Username</span>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            className="w-full border border-hairline bg-canvas px-3 py-2.5 text-body-md text-ink outline-none focus:border-body-mid"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-caption-mono-sm text-mute">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full border border-hairline bg-canvas px-3 py-2.5 text-body-md text-ink outline-none focus:border-body-mid"
          />
        </label>
        {error ? <p className="text-body-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-pill border border-primary bg-primary px-4 py-2.5 text-button-md text-on-primary disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function OpsLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Suspense fallback={<div className="text-mute">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
