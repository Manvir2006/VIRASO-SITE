import { NextRequest, NextResponse } from "next/server";
import { createB2BInquiry, validateGSTIN } from "@/lib/b2b-store";
import { addCustomerNotification } from "@/lib/customer-notification-store";
import { sendB2BAcknowledgementEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Required fields validation
    const company_name = (body.company_name || "").trim();
    const company_address = (body.company_address || "").trim();
    const city = (body.city || "").trim();
    const state = (body.state || "").trim();
    const pin_code = (body.pin_code || "").replace(/[^0-9]/g, "").trim();
    const contact_person_name = (body.contact_person_name || "").trim();
    const mobile = (body.mobile || "").replace(/[^0-9]/g, "").slice(-10);
    const whatsapp_number = (body.whatsapp_number || "").replace(/[^0-9]/g, "").slice(-10) || mobile;
    const email = (body.email || "").trim().toLowerCase();
    const monthly_quantity = (body.monthly_quantity || "").trim();
    const product_requirement = (body.product_requirement || "").trim();

    if (!company_name) {
      return NextResponse.json({ error: "Company / Business Name is required." }, { status: 400 });
    }
    if (!company_address) {
      return NextResponse.json({ error: "Company Address is required." }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ error: "City is required." }, { status: 400 });
    }
    if (!state) {
      return NextResponse.json({ error: "State is required." }, { status: 400 });
    }
    if (!pin_code || pin_code.length !== 6) {
      return NextResponse.json({ error: "Please provide a valid 6-digit PIN Code." }, { status: 400 });
    }
    if (!contact_person_name) {
      return NextResponse.json({ error: "Contact Person Name is required." }, { status: 400 });
    }
    if (!mobile || mobile.length !== 10) {
      return NextResponse.json({ error: "Please provide a valid 10-digit Mobile Number." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid Email Address." }, { status: 400 });
    }
    if (!monthly_quantity) {
      return NextResponse.json({ error: "Monthly Required Quantity is required." }, { status: 400 });
    }
    if (!product_requirement) {
      return NextResponse.json({ error: "Product Requirement details are required." }, { status: 400 });
    }

    // Optional GST validation
    const rawGst = (body.gst_number || "").trim().toUpperCase();
    if (rawGst) {
      const gstCheck = validateGSTIN(rawGst);
      if (!gstCheck.valid) {
        return NextResponse.json({ error: gstCheck.error }, { status: 400 });
      }
    }

    // Persist into database
    const inquiry = await createB2BInquiry({
      company_name,
      gst_number: rawGst || undefined,
      company_address,
      city,
      state,
      pin_code,
      website: body.website ? String(body.website).trim() : undefined,
      contact_person_name,
      mobile,
      whatsapp_number,
      email,
      monthly_quantity,
      product_requirement,
      purchase_frequency: body.purchase_frequency || "Regular Bulk Purchase",
      additional_message: body.additional_message ? String(body.additional_message).trim() : undefined,
    });

    // Generate Customer Notification for logged-in or identified user
    try {
      await addCustomerNotification({
        recipient_key: mobile,
        title: "B2B Inquiry Submitted",
        message: `Your B2B inquiry has been received successfully. Inquiry ID: ${inquiry.inquiry_number}. Our business team will contact you shortly.`,
        inquiry_id: inquiry.inquiry_number,
      });
    } catch (notifErr) {
      console.warn("Failed to create customer notification record:", notifErr);
    }

    // Non-blocking acknowledgement email
    sendB2BAcknowledgementEmail(inquiry).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "B2B Inquiry Submitted Successfully",
        inquiry: {
          id: inquiry.id,
          inquiry_number: inquiry.inquiry_number,
          company_name: inquiry.company_name,
          contact_person_name: inquiry.contact_person_name,
          created_at: inquiry.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("B2B submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit B2B inquiry. Please try again." },
      { status: 500 }
    );
  }
}
