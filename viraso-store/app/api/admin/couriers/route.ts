import { NextRequest, NextResponse } from "next/server";
import {
  listCouriers,
  saveCourier,
  deleteCourier,
  getCourierById,
} from "@/lib/courier-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const couriers = await listCouriers(false);
  return NextResponse.json({ couriers });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { name, tracking_url, url_type, logo_url, is_active } = body || {};

    if (!name || !tracking_url || !url_type) {
      return NextResponse.json(
        { error: "Courier Name, Tracking URL, and URL Type are required." },
        { status: 400 }
      );
    }

    const courier = await saveCourier({
      name,
      tracking_url,
      url_type,
      logo_url,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    return NextResponse.json({ courier }, { status: 201 });
  } catch (error: any) {
    console.error("Create courier error:", error);
    return NextResponse.json({ error: error.message || "Failed to create courier." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { id, name, tracking_url, url_type, logo_url, is_active, display_order } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Courier ID is required." }, { status: 400 });
    }

    const courier = await saveCourier({
      id,
      name,
      tracking_url,
      url_type,
      logo_url,
      is_active,
      display_order,
    });

    return NextResponse.json({ courier });
  } catch (error: any) {
    console.error("Update courier error:", error);
    return NextResponse.json({ error: error.message || "Failed to update courier." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Courier ID is required." }, { status: 400 });
    }

    const ok = await deleteCourier(id);
    if (!ok) return NextResponse.json({ error: "Courier not found." }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete courier error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete courier." }, { status: 500 });
  }
}
