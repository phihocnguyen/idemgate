"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOperation, type AdminOperation } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-hairline py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-caption-mono-sm text-mute">{label}</dt>
      <dd className="min-w-0 break-all font-mono text-body-sm text-body">{children}</dd>
    </div>
  );
}

export function OperationDetail({ id }: { id: string }) {
  const [op, setOp] = useState<AdminOperation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getOperation(id);
        if (!cancelled) setOp(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/ops" className="text-body-sm text-mute hover:text-ink">
          ← Operations
        </Link>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!op) {
    return <p className="text-mute">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/ops" className="text-body-sm text-mute hover:text-ink">
          ← Operations
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-display-xs text-ink">Operation</h1>
          <StatusBadge status={op.status} />
        </div>
        <p className="mt-2 font-mono text-body-sm text-mute">{op.operationId}</p>
      </div>

      <dl className="border border-hairline bg-canvas-soft/20 px-4">
        <Row label="Scope">{op.scope}</Row>
        <Row label="Idempotency key">{op.key}</Row>
        <Row label="Fingerprint">{op.fingerprint}</Row>
        <Row label="Business key">{op.businessKey || "—"}</Row>
        <Row label="Request">
          {[op.requestMethod, op.requestPath].filter(Boolean).join(" ") || "—"}
        </Row>
        <Row label="Response status">{op.responseStatus ?? "—"}</Row>
        <Row label="Created">{fmt(op.createdAt)}</Row>
        <Row label="Updated">{fmt(op.updatedAt)}</Row>
        <Row label="Completed">{fmt(op.completedAt)}</Row>
        <Row label="Lease expires">{fmt(op.leaseExpiresAt)}</Row>
        <Row label="Expires">{fmt(op.expiresAt)}</Row>
        <Row label="Retain until">{fmt(op.retainUntil)}</Row>
        <Row label="Body stored">{op.responseBodyPresent ? "yes" : "no"}</Row>
      </dl>

      <section className="border border-hairline p-4">
        <h2 className="text-caption-mono-sm text-mute">Response body</h2>
        {op.responseBody ? (
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all font-mono text-body-sm text-body">
            {op.responseBody}
          </pre>
        ) : (
          <p className="mt-3 text-body-sm text-body">
            {op.responseBodyPresent
              ? "A body is stored, but display is disabled (exposeResponseBody=false). Enable it under Settings only if acceptable."
              : "No response body was stored for this operation."}
          </p>
        )}
      </section>
    </div>
  );
}
