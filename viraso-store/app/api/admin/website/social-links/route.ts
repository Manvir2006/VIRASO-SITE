import { NextRequest, NextResponse } from "next/server";
import { getSocialLinks, saveSocialLinks } from "@/lib/social-links-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  return NextResponse.json(await getSocialLinks());
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const links = await saveSocialLinks(await request.json());
    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save social links." }, { status: 400 });
  }
}
