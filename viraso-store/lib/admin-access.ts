import { NextRequest, NextResponse } from "next/server";

export function getAdminAccessKey(): string | undefined {
  return process.env.ADMIN_ACCESS_KEY;
}

export function adminAccessKeyConfigured(): boolean {
  return Boolean(process.env.ADMIN_ACCESS_KEY);
}

export function isAdminRequest(request: NextRequest): boolean {
  const configuredKey = process.env.ADMIN_ACCESS_KEY;
  return Boolean(configuredKey && request.headers.get("x-admin-key") === configuredKey);
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
}
