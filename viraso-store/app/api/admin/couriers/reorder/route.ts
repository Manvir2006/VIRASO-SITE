import { NextRequest, NextResponse } from "next/server";
import { reorderCouriers } from "@/lib/courier-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { orderedIds } = body || {};

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds array is required." }, { status: 400 });
    }

    const couriers = await reorderCouriers(orderedIds);
    return NextResponse.json({ couriers });
  } catch (error: any) {
    console.error("Reorder couriers error:", error);
    return NextResponse.json({ error: error.message || "Failed to reorder couriers." }, { status: 500 });
  }
}
