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

export function getAdminAccessKey(): string | undefined {
  return process.env.ADMIN_ACCESS_KEY;
}

export function adminAccessKeyConfigured(): boolean {
  return Boolean(process.env.ADMIN_ACCESS_KEY && process.env.ADMIN_ACCESS_KEY.trim());
}

export function isAdminRequest(request: NextRequest): boolean {
  const configuredKey = process.env.ADMIN_ACCESS_KEY;
  if (!configuredKey || !configuredKey.trim()) {
    return false;
  }

  // 1. Check HTTP-only cookie
  const cookieAuth = request.cookies.get("viraso-admin-access")?.value === "granted";
  if (cookieAuth) {
    return true;
  }

  // 2. Check x-admin-key header
  const headerKey = request.headers.get("x-admin-key");
  if (headerKey && safeCompare(headerKey.trim(), configuredKey.trim())) {
    return true;
  }

  return false;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
}
