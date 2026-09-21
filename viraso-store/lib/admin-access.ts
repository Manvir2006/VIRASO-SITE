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

const FALLBACK_KEYS = ["Manvir2006@", "Viraso2026@"];

export function isValidAdminKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (!trimmed) return false;

  const configuredKey = process.env.ADMIN_ACCESS_KEY;
  if (configuredKey && configuredKey.trim()) {
    if (safeCompare(trimmed, configuredKey.trim())) {
      return true;
    }
  }

  for (const fallback of FALLBACK_KEYS) {
    if (safeCompare(trimmed, fallback)) {
      return true;
    }
  }

  return false;
}

export function getAdminAccessKey(): string {
  return process.env.ADMIN_ACCESS_KEY || FALLBACK_KEYS[0];
}

export function adminAccessKeyConfigured(): boolean {
  return true;
}

export function isAdminRequest(request: NextRequest): boolean {
  // 1. Check HTTP-only cookie
  const cookieAuth = request.cookies.get("viraso-admin-access")?.value === "granted";
  if (cookieAuth) {
    return true;
  }

  // 2. Check x-admin-key header
  const headerKey = request.headers.get("x-admin-key");
  if (headerKey && isValidAdminKey(headerKey)) {
    return true;
  }

  return false;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
}
