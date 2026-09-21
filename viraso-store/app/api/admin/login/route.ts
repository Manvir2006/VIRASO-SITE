import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const configuredKey = process.env.ADMIN_ACCESS_KEY;

  if (!configuredKey || !configuredKey.trim()) {
    return NextResponse.json(
      { error: "Server configuration error: ADMIN_ACCESS_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const rawKey = body?.key;

  if (!rawKey || typeof rawKey !== "string") {
    return NextResponse.json({ error: "Admin access key is required." }, { status: 400 });
  }

  const submittedKey = rawKey.trim();
  const validKey = configuredKey.trim();

  if (!safeCompare(submittedKey, validKey)) {
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
