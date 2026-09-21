import { NextRequest, NextResponse } from "next/server";
import { listEnquiries, updateEnquiryStatus, deleteEnquiry, type EnquiryStatus } from "@/lib/support-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const status = searchParams.get("status") || "";

  let enquiries = await listEnquiries(false);

  if (status) {
    enquiries = enquiries.filter((e) => e.status === status);
  }

  if (search) {
    enquiries = enquiries.filter(
      (e) =>
        e.id.toLowerCase().includes(search) ||
        e.name.toLowerCase().includes(search) ||
        e.mobile.includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.subject.toLowerCase().includes(search) ||
        e.message.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ enquiries });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { id, status, internalNotes } = body || {};

    if (!id || !status) {
      return NextResponse.json({ error: "Enquiry ID and status are required." }, { status: 400 });
    }

    const enquiry = await updateEnquiryStatus(id, status as EnquiryStatus, internalNotes);
    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }

    return NextResponse.json({ enquiry });
  } catch (error) {
    console.error("Admin enquiry update error:", error);
    return NextResponse.json({ error: "Failed to update enquiry." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Enquiry ID is required." }, { status: 400 });
    }

    const ok = await deleteEnquiry(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("Admin enquiry delete error:", error);
    return NextResponse.json({ error: "Failed to delete enquiry." }, { status: 500 });
  }
}
