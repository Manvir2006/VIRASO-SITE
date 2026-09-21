import { NextRequest, NextResponse } from "next/server";

const configuredKey = process.env.ADMIN_ACCESS_KEY;

export function adminAccessKeyConfigured() {
  return Boolean(configuredKey);
}

export function isAdminRequest(request: NextRequest) {
  return Boolean(configuredKey && request.headers.get("x-admin-key") === configuredKey);
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
}
