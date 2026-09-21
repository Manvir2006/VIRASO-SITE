import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const configuredKey = process.env.ADMIN_ACCESS_KEY;
  const { key } = await request.json();
  if (!configuredKey || key !== configuredKey) {
    return NextResponse.json({ error: "Invalid admin access key." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("viraso-admin-access", "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
