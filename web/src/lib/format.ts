export function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function shortId(id: string) {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}
