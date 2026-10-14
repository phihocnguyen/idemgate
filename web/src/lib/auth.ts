const KEY = "idemgate_ops_basic";

export function getBasicAuth(): string | null {
  return sessionStorage.getItem(KEY);
}

export function isLoggedIn(): boolean {
  return !!getBasicAuth();
}

export function login(user: string, password: string) {
  sessionStorage.setItem(KEY, btoa(`${user}:${password}`));
}

export function logout() {
  sessionStorage.removeItem(KEY);
}

export function authHeaders(): HeadersInit {
  const basic = getBasicAuth();
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (basic) h.Authorization = `Basic ${basic}`;
  return h;
}
