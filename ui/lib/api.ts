const baseUrl = () =>
  (process.env.NEXT_PUBLIC_IDEMGATE_URL || "http://localhost:8080").replace(/\/$/, "");

const apiKey = () => process.env.NEXT_PUBLIC_IDEMGATE_API_KEY || "dev-secret-change-me";

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Api-Key": apiKey(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type AdminOperation = {
  operationId: string;
  status: string;
  scope: string;
  key: string;
  fingerprint: string;
  businessKey?: string | null;
  requestMethod?: string | null;
  requestPath?: string | null;
  leaseExpiresAt?: string | null;
  expiresAt: string;
  retainUntil: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  responseStatus?: number | null;
  responseBodyPresent: boolean;
  responseBody?: string | null;
};

export type AdminPage = {
  items: AdminOperation[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminSettings = {
  retentionDays: number;
  defaultTtlSeconds: number;
  defaultLeaseSeconds: number;
  maxResponseBodyBytes: number;
  exposeResponseBody: boolean;
  scopes: string[];
};

export function listOperations(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  return adminFetch<AdminPage>(`/v1/admin/operations?${q.toString()}`);
}

export function getOperation(id: string) {
  return adminFetch<AdminOperation>(`/v1/admin/operations/${id}`);
}

export function getSettings() {
  return adminFetch<AdminSettings>("/v1/admin/settings");
}

export function patchSettings(body: Partial<AdminSettings>) {
  return adminFetch<AdminSettings>("/v1/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
