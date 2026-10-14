const styles: Record<string, string> = {
  IN_PROGRESS: "border-accent-breeze/40 text-accent-breeze",
  COMPLETED: "border-accent-sunset/40 text-accent-sunset",
  FAILED: "border-accent-twilight/40 text-accent-twilight",
  UNKNOWN: "border-accent-twilight/40 text-accent-twilight",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border px-2 py-1 text-caption-mono-sm ${styles[status] ?? "border-hairline text-mute"}`}
    >
      {status}
    </span>
  );
}
