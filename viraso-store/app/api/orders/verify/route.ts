import { NextRequest, NextResponse } from "next/server";
import {
  getOrderByCashfreeId,
  getOrderByNumber,
  markOrderAsPaid,
} from "@/lib/support-store";
import {
  isCashfreeConfigured,
  verifyCashfreePaymentStatus,
} from "@/lib/cashfree";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");

  return handleVerification(orderId, orderNumber);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = body.order_id || body.orderId;
    const orderNumber = body.orderNumber;

    return handleVerification(orderId, orderNumber);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}

async function handleVerification(orderId?: string | null, orderNumber?: string | null) {
  const cleanOrderId = (orderId || "").trim();
  const cleanOrderNumber = (orderNumber || "").trim();

  if (!cleanOrderId && !cleanOrderNumber) {
    return NextResponse.json(
      { error: "order_id or orderNumber is required to verify payment." },
      { status: 400 }
    );
  }

  // Find local order record
  let order = cleanOrderId ? await getOrderByCashfreeId(cleanOrderId) : null;
  if (!order && cleanOrderNumber) {
    order = await getOrderByNumber(cleanOrderNumber);
  }

  // If Cashfree keys are not configured, treat as demo order
  if (!isCashfreeConfigured()) {
    if (order) {
      const updated = await markOrderAsPaid(order.orderNumber, order.cashfreePaymentId || "DEMO_PAY_SUCCESS");
      return NextResponse.json({
        success: true,
        paymentStatus: "Paid",
        isDemo: true,
        order: updated || order,
      });
    }
    return NextResponse.json({
      success: true,
      paymentStatus: "Paid",
      isDemo: true,
      message: "Demo order verification successful.",
    });
  }

  // Real Cashfree verification
  if (!cleanOrderId) {
    return NextResponse.json(
      { error: "Cashfree order_id is required for verification." },
      { status: 400 }
    );
  }

  try {
    const result = await verifyCashfreePaymentStatus(cleanOrderId);

    if (result.isPaid) {
      const updatedOrder = await markOrderAsPaid(cleanOrderId, result.cfPaymentId);
      return NextResponse.json({
        success: true,
        paymentStatus: "Paid",
        orderId: cleanOrderId,
        cashfreePaymentId: result.cfPaymentId,
        order: updatedOrder || order,
      });
    } else {
      return NextResponse.json({
        success: false,
        paymentStatus: result.orderStatus || "PENDING",
        message: result.message || "Payment has not been completed.",
        order,
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify payment with Cashfree." },
      { status: 500 }
    );
  }
}
