import { NextResponse } from "next/server";
import { listCouriers } from "@/lib/courier-store";

export async function GET() {
  try {
    const couriers = await listCouriers(true);
    return NextResponse.json({ couriers });
  } catch (error) {
    console.error("Public courier list error:", error);
    return NextResponse.json({ error: "Failed to load couriers." }, { status: 500 });
  }
}
