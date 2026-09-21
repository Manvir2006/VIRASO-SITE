import { NextRequest, NextResponse } from "next/server";
import {
  listB2BInquiries,
  getB2BInquiryById,
  updateB2BInquiry,
  deleteB2BInquiry,
  getB2BStats,
  type B2BInquiryStatus,
} from "@/lib/b2b-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const item = await getB2BInquiryById(id);
      return item
        ? NextResponse.json({ inquiry: item })
        : NextResponse.json({ error: "B2B Inquiry not found." }, { status: 404 });
    }

    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const status = searchParams.get("status");
    const stateFilter = (searchParams.get("state") || "").trim().toLowerCase();
    const frequency = searchParams.get("frequency");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let items = await listB2BInquiries(false);

    if (status && status !== "All") {
      items = items.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }

    if (stateFilter) {
      items = items.filter((i) => i.state.toLowerCase().includes(stateFilter));
    }

    if (frequency && frequency !== "All") {
      items = items.filter((i) => i.purchase_frequency.toLowerCase() === frequency.toLowerCase());
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      items = items.filter((i) => new Date(i.created_at).getTime() >= fromTime);
    }

    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999);
      items = items.filter((i) => new Date(i.created_at).getTime() <= toTime);
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.inquiry_number.toLowerCase().includes(search) ||
          i.company_name.toLowerCase().includes(search) ||
          i.contact_person_name.toLowerCase().includes(search) ||
          i.mobile.includes(search) ||
          (i.whatsapp_number && i.whatsapp_number.includes(search)) ||
          i.email.toLowerCase().includes(search) ||
          (i.gst_number && i.gst_number.toLowerCase().includes(search)) ||
          i.city.toLowerCase().includes(search) ||
          i.state.toLowerCase().includes(search)
      );
    }

    const stats = await getB2BStats();

    return NextResponse.json({ inquiries: items, stats });
  } catch (error: any) {
    console.error("Admin list B2B inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch B2B inquiries." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const body = await request.json();
    const id = body.id || body.inquiry_number;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID or Number is required." }, { status: 400 });
    }

    const updated = await updateB2BInquiry(id, body);
    if (!updated) {
      return NextResponse.json({ error: "B2B Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({ inquiry: updated });
  } catch (error: any) {
    console.error("Admin update B2B inquiry error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update inquiry." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || searchParams.get("inquiry_number");
    const reason = searchParams.get("reason") || "Deleted by admin";

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required." }, { status: 400 });
    }

    const ok = await deleteB2BInquiry(id, reason);
    if (!ok) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "B2B inquiry deleted successfully." });
  } catch (error: any) {
    console.error("Admin delete B2B inquiry error:", error);
    return NextResponse.json({ error: "Failed to delete inquiry." }, { status: 500 });
  }
}
