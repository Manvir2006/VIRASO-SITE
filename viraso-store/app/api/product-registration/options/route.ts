import { NextResponse } from "next/server";
import { getRegistrationOptions } from "@/lib/product-registration-store";

export async function GET() {
  return NextResponse.json(await getRegistrationOptions());
}
