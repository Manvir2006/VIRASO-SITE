import { NextRequest, NextResponse } from "next/server";
import { listWarranties, updateWarranty, warrantyStats, type WarrantyStatus } from "@/lib/warranty-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const status = searchParams.get("status") || "";

  let warranties = await listWarranties();

  if (status) {
    warranties = warranties.filter((w) => w.status === status);
  }

  if (search) {
    warranties = warranties.filter(
      (w) =>
        w.registrationId.toLowerCase().includes(search) ||
        w.serialNumber.toLowerCase().includes(search) ||
        w.customerName.toLowerCase().includes(search) ||
        w.mobile.includes(search) ||
        w.productName.toLowerCase().includes(search)
    );
  }

  const stats = await warrantyStats();
  return NextResponse.json({ warranties, stats });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { registrationId, statusOverride, notes, extendedMonths } = body || {};

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const updated = await updateWarranty({
      registrationId,
      statusOverride: statusOverride as WarrantyStatus,
      notes,
      extendedMonths: extendedMonths !== undefined ? Number(extendedMonths) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Warranty record not found." }, { status: 404 });
    }

    return NextResponse.json({ warranty: updated });
  } catch (error) {
    console.error("Warranty update error:", error);
    return NextResponse.json({ error: "Failed to update warranty." }, { status: 500 });
  }
}
