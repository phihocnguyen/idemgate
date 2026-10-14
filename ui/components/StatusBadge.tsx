const styles: Record<string, string> = {
  IN_PROGRESS: "bg-app-warn/25 text-app-warn",
  COMPLETED: "bg-app-ok/25 text-app-ok",
  FAILED: "bg-app-bad/25 text-app-bad",
  UNKNOWN: "bg-app-bad/25 text-app-bad",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-app-line text-app-muted"}`}
    >
      {status}
    </span>
  );
}
