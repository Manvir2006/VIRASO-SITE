import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }
  if (request.cookies.get("viraso-admin-access")?.value !== "granted") {
    return NextResponse.redirect(
      new URL(`/admin/login?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
