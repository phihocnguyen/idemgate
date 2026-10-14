const styles: Record<string, string> = {
  COMPLETED: "border-emerald-500/40 text-emerald-400",
  IN_PROGRESS: "border-amber-400/40 text-amber-300",
  UNKNOWN: "border-body-mid/40 text-body-mid",
  FAILED: "border-red-400/40 text-red-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        "inline-flex border px-2 py-0.5 font-mono text-[11px] tracking-wide uppercase",
        styles[status] || "border-hairline text-mute",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
