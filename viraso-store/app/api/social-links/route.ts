import { NextResponse } from "next/server";
import { getSocialLinks } from "@/lib/social-links-store";

export async function GET() {
  return NextResponse.json(await getSocialLinks(), { headers: { "Cache-Control": "no-store" } });
}
