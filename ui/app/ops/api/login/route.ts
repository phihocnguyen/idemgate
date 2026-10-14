import { NextResponse } from "next/server";
import { OPS_COOKIE, opsCredentials } from "@/lib/ops-auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { user?: string; password?: string };
  const { user, pass } = opsCredentials();
  if (body.user !== user || body.password !== pass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OPS_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
