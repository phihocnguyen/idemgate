export function StatusBadge({ status }: { status: string }) {
  const cls = ["badge", `badge-${status}`].join(" ");
  return <span className={cls}>{status}</span>;
}
