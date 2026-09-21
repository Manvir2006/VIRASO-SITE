import { NextRequest, NextResponse } from "next/server";
import { getB2BInquiryById, updateB2BInquiry } from "@/lib/b2b-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const body = await request.json();
    const id = body.id || body.inquiry_id || body.inquiry_number;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required." }, { status: 400 });
    }

    const inquiry = await getB2BInquiryById(id);
    if (!inquiry) {
      return NextResponse.json({ error: "B2B inquiry not found." }, { status: 404 });
    }

    const cleanMobile = inquiry.mobile.replace(/[^0-9]/g, "").slice(-10);
    const customerKey = cleanMobile ? `mob_${cleanMobile}` : `eml_${inquiry.email.trim().toLowerCase()}`;
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const note = inquiry.admin_notes
      ? `${inquiry.admin_notes}\n[Converted to Customer Profile on ${timestamp}]`
      : `[Converted to Customer Profile on ${timestamp}]`;

    const updated = await updateB2BInquiry(inquiry.id, {
      status: "Converted",
      linked_customer_id: customerKey,
      admin_notes: note,
    });

    return NextResponse.json({
      success: true,
      message: "B2B Inquiry successfully converted and linked to Customer CRM profile.",
      customerId: customerKey,
      inquiry: updated,
    });
  } catch (error: any) {
    console.error("Convert B2B inquiry error:", error);
    return NextResponse.json({ error: "Failed to convert inquiry to customer profile." }, { status: 500 });
  }
}
