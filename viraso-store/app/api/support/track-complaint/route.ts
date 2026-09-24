import { NextRequest, NextResponse } from "next/server";
import { findComplaint } from "@/lib/support-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get("complaintId") || searchParams.get("id");
    const mobile = searchParams.get("mobile");

    if (!complaintId || !complaintId.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid Complaint ID." },
        { status: 400 }
      );
    }

    const complaint = await findComplaint(complaintId.trim(), mobile?.trim());

    if (!complaint) {
      return NextResponse.json(
        {
          error:
            "Complaint not found. Please verify the Complaint ID (e.g., VC-XXXXXX) and try again.",
        },
        { status: 404 }
      );
    }

    // Return sanitized complaint details for customer tracking view
    return NextResponse.json(
      {
        complaint: {
          id: complaint.id,
          customerName: complaint.customerName,
          orderNumber: complaint.orderNumber,
          productName: complaint.productName,
          productIdSku: complaint.productIdSku,
          purchaseDate: complaint.purchaseDate,
          complaintType: complaint.complaintType,
          complaintDescription: complaint.complaintDescription,
          preferredContactMethod: complaint.preferredContactMethod,
          status: complaint.status,
          submittedAt: complaint.submittedAt,
          updatedAt: complaint.updatedAt,
          productImageUrl: complaint.productImageUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Track complaint API error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve complaint details. Please try again." },
      { status: 500 }
    );
  }
}
