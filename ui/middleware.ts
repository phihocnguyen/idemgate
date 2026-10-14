import { NextResponse, type NextRequest } from "next/server";
import { OPS_COOKIE } from "@/lib/ops-auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/ops")) return NextResponse.next();
  if (pathname === "/ops/login" || pathname.startsWith("/ops/api/")) return NextResponse.next();

  const session = req.cookies.get(OPS_COOKIE)?.value;
  if (session !== "1") {
    const url = req.nextUrl.clone();
    url.pathname = "/ops/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*"],
};
