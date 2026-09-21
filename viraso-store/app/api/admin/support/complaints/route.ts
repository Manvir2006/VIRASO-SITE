import { NextRequest, NextResponse } from "next/server";
import { listComplaints, updateComplaintStatus, deleteComplaint, type ComplaintStatus } from "@/lib/support-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const status = searchParams.get("status") || "";

  let complaints = await listComplaints(false);

  if (status) {
    complaints = complaints.filter((c) => c.status === status);
  }

  if (search) {
    complaints = complaints.filter(
      (c) =>
        c.id.toLowerCase().includes(search) ||
        c.customerName.toLowerCase().includes(search) ||
        c.mobileNumber.includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.productName.toLowerCase().includes(search) ||
        c.orderNumber.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ complaints });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { id, status, internalNotes } = body || {};

    if (!id || !status) {
      return NextResponse.json({ error: "Complaint ID and status are required." }, { status: 400 });
    }

    const complaint = await updateComplaintStatus(id, status as ComplaintStatus, internalNotes);
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error("Admin complaint update error:", error);
    return NextResponse.json({ error: "Failed to update complaint." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Complaint ID is required." }, { status: 400 });
    }

    const ok = await deleteComplaint(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("Admin complaint delete error:", error);
    return NextResponse.json({ error: "Failed to delete complaint." }, { status: 500 });
  }
}
