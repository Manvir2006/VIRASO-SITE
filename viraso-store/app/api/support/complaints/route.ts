import { NextRequest, NextResponse } from "next/server";
import { createComplaint, saveUploadedFile } from "@/lib/support-store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

    const required = [
      "customerName",
      "mobileNumber",
      "email",
      "orderNumber",
      "productName",
      "productIdSku",
      "purchaseDate",
      "complaintType",
      "complaintDescription",
      "preferredContactMethod",
    ];

    for (const field of required) {
      if (!String(fields[field] || "").trim()) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 });
      }
    }

    const productImage = formData.get("productImage");
    const invoice = formData.get("invoice");

    const complaintPayload = {
      customerName: String(fields.customerName),
      mobileNumber: String(fields.mobileNumber),
      email: String(fields.email),
      orderNumber: String(fields.orderNumber),
      productName: String(fields.productName),
      productIdSku: String(fields.productIdSku),
      purchaseDate: String(fields.purchaseDate),
      complaintType: String(fields.complaintType),
      complaintDescription: String(fields.complaintDescription),
      preferredContactMethod: String(fields.preferredContactMethod),
      productImageUrl: productImage && typeof productImage !== "string" ? await saveUploadedFile(productImage as File, "product-complaints") : undefined,
      invoiceUrl: invoice && typeof invoice !== "string" ? await saveUploadedFile(invoice as File, "complaint-invoices") : undefined,
    };

    const complaint = await createComplaint(complaintPayload);
    return NextResponse.json({ complaint }, { status: 200 });
  } catch (error) {
    console.error("Complaint API error:", error);
    return NextResponse.json({ error: "Failed to submit complaint." }, { status: 500 });
  }
}
