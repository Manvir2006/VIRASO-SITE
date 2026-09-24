import { NextRequest, NextResponse } from "next/server";
import { markOrderAsPaid, updateOrder, getOrderByCashfreeId } from "@/lib/support-store";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // If live webhook secrets are configured, verify the signature
    const hasSecret = Boolean(
      process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY
    );

    if (hasSecret && (!signature || !timestamp)) {
      console.warn("Cashfree Webhook received without signature headers");
      return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
    }

    if (hasSecret) {
      const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        console.error("Cashfree Webhook signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType = payload.type || payload.event || "";
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const cfOrderId = orderData.order_id || payload.orderId || "";
    const paymentStatus = paymentData.payment_status || "";
    const cfPaymentId = paymentData.cf_payment_id || "";

    console.log(`Cashfree Webhook received: [${eventType}] for Order: ${cfOrderId}, Status: ${paymentStatus}`);

    if (cfOrderId) {
      if (
        eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
        String(paymentStatus).toUpperCase() === "SUCCESS"
      ) {
        await markOrderAsPaid(cfOrderId, String(cfPaymentId));
        console.log(`Order ${cfOrderId} marked as Paid via webhook`);
      } else if (
        eventType === "PAYMENT_FAILED_WEBHOOK" ||
        String(paymentStatus).toUpperCase() === "FAILED"
      ) {
        const order = await getOrderByCashfreeId(cfOrderId);
        if (order && order.paymentStatus !== "Paid") {
          await updateOrder(order.orderNumber, {
            paymentStatus: "Failed",
            internalNotes: `${order.internalNotes ? order.internalNotes + "\n" : ""}[Cashfree Payment Failed: ${paymentData.payment_message || "Declined"}]`,
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
