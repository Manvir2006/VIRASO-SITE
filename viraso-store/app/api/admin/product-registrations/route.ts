import { NextRequest, NextResponse } from "next/server";
import {
  filterRegistrations,
  listRegistrations,
  registrationStats,
  registrationsToCsv,
  updateRegistration,
  updateRegistrationDetails,
  deleteRegistration,
  type RegistrationStatus,
} from "@/lib/product-registration-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const registrations = await listRegistrations(false);
  const searchParams = new URL(request.url).searchParams;
  const registrationId = searchParams.get("id");
  if (registrationId) {
    const registration = registrations.find((item) => item.registrationId === registrationId);
    if (!registration) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    return NextResponse.json({ registration });
  }
  const filtered = filterRegistrations(registrations, searchParams);
  const format = searchParams.get("format");
  if (format === "csv") {
    return new Response(registrationsToCsv(filtered), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=product-registrations.csv",
      },
    });
  }
  return NextResponse.json({ registrations: filtered, stats: await registrationStats() });
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return unauthorizedAdminResponse();
    const body = await request.json();
    if (!body.registrationId) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    let registration;
    if (body.customerName !== undefined || body.dealerName !== undefined || body.serialNumber !== undefined) {
      // Full detail edit
      const { registrationId, note, admin, ...updates } = body;
      registration = await updateRegistrationDetails(registrationId, updates, note, admin || "Admin");
    } else {
      // Status update
      if (!body.status) {
        return NextResponse.json({ error: "Status is required." }, { status: 400 });
      }
      registration = await updateRegistration(
        body.registrationId,
        body.status as RegistrationStatus,
        body.note,
        body.admin || "Admin"
      );
    }

    if (!registration) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    return NextResponse.json({ registration });
  } catch (error) {
    console.error("Update registration error:", error);
    return NextResponse.json({ error: "Unable to update registration." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const reason = searchParams.get("reason") || "Deleted by administrator";

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const ok = await deleteRegistration(id, reason);
    if (!ok) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json({ error: "Failed to delete registration." }, { status: 500 });
  }
}
