import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isLoggedIn, login, logout } from "../lib/auth";
import { probeLogin } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isLoggedIn()) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    login(user, password);
    try {
      await probeLogin();
      navigate("/", { replace: true });
    } catch {
      logout();
      setError("Invalid credentials or server unreachable. Is IdemGate running on :8080?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={onSubmit}>
        <p className="mono" style={{ color: "var(--muted)", margin: "0 0 0.5rem" }}>
          Idem<span style={{ color: "var(--accent)" }}>Gate</span>
        </p>
        <h1>Ops console</h1>
        <p className="lead">Inspect claims, leases, and retention — same process as the registry.</p>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label className="field">
            Username
            <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
