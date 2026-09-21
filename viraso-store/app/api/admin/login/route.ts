import { NextRequest, NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/admin-access";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawKey = body?.key;

  if (!rawKey || typeof rawKey !== "string") {
    return NextResponse.json({ error: "Admin access key is required." }, { status: 400 });
  }

  const submittedKey = rawKey.trim();

  if (!isValidAdminKey(submittedKey)) {
    return NextResponse.json({ error: "Invalid admin access key." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("viraso-admin-access", "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
