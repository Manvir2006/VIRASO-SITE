import { NextRequest, NextResponse } from "next/server";
import { createOrderRecord, updateOrder } from "@/lib/support-store";
import {
  createCashfreeOrder,
  isCashfreeConfigured,
  getCashfreeEnv,
} from "@/lib/cashfree";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerName, phone, address, items, totalAmount } = data || {};

    if (!customerName || !phone || !address) {
      return NextResponse.json(
        { error: "Customer name, phone, and address are required." },
        { status: 400 }
      );
    }

    const firstItem = items && items.length > 0 ? items[0] : null;
    const productName = firstItem ? firstItem.name : "Viraso Sewing Machine Component";
    const totalQuantity =
      items && items.length > 0
        ? items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)
        : 1;

    const calculatedTotal =
      typeof totalAmount === "number" && totalAmount > 0
        ? totalAmount
        : items && items.length > 0
        ? items.reduce(
            (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
            0
          )
        : 1999;

    // Generate unique Cashfree order ID (letters, numbers, underscores, max 45 chars)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cfOrderId = `CF_ORD_${timestamp}_${randomSuffix}`;

    // Create the order record in database with "Pending" status
    const order = await createOrderRecord({
      customerName: String(customerName).trim(),
      mobile: String(phone).trim(),
      email: data.email ? String(data.email).trim() : "",
      product: productName,
      quantity: totalQuantity,
      totalAmount: calculatedTotal,
      items: items || [],
      shippingAddress: String(address).trim(),
      cashfreeOrderId: cfOrderId,
      cashfreePaymentId: "",
      paymentStatus: "Pending",
    });

    // Check if Cashfree live/sandbox API credentials are configured
    const configured = isCashfreeConfigured();

    if (configured) {
      // Determine origin for return_url callback
      const host = request.headers.get("host") || "localhost:3000";
      const isProd = getCashfreeEnv() === "production";
      const proto = isProd ? "https" : (request.headers.get("x-forwarded-proto") || "http");
      const configuredBase = process.env.NEXT_PUBLIC_BASE_URL;
      const origin = configuredBase && configuredBase.startsWith("https://")
        ? configuredBase
        : `${proto}://${host}`;
      const returnUrl = `${origin}/checkout/verify?order_id=${encodeURIComponent(cfOrderId)}`;

      try {
        const cfResponse = await createCashfreeOrder({
          orderId: cfOrderId,
          orderAmount: calculatedTotal,
          customerName: customerName.trim(),
          customerPhone: phone.trim(),
          customerEmail: data.email?.trim(),
          returnUrl,
          orderNote: `Order #${order.orderNumber} for ${customerName.trim()}`,
        });

        // Update order with confirmed Cashfree ID
        await updateOrder(order.orderNumber, {
          cashfreeOrderId: cfResponse.orderId,
        });

        return NextResponse.json({
          success: true,
          isLiveGateway: true,
          mode: getCashfreeEnv(),
          paymentSessionId: cfResponse.paymentSessionId,
          cashfreeOrderId: cfResponse.orderId,
          orderNumber: order.orderNumber,
          order,
        });
      } catch (cfError: any) {
        console.error("Cashfree API invocation error:", cfError);
        return NextResponse.json(
          {
            error:
              cfError?.message ||
              "Failed to initialize Cashfree payment session. Please verify your Cashfree credentials.",
          },
          { status: 400 }
        );
      }
    }

    // Fallback: If Cashfree keys are not configured yet, record order as Demo/Test
    // This allows testing the store flow prior to adding credentials in .env.local
    const demoPaymentId = `DEMO_PAY_${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const confirmedDemoOrder = await updateOrder(order.orderNumber, {
      paymentStatus: "Paid",
      status: "Processing",
      cashfreePaymentId: demoPaymentId,
    });

    return NextResponse.json({
      success: true,
      isLiveGateway: false,
      mode: "demo",
      order: confirmedDemoOrder || order,
      message:
        "Demo Mode: CASHFREE_APP_ID & CASHFREE_SECRET_KEY are not configured in .env.local. Order has been saved as a demo test order.",
    });
  } catch (error: any) {
    console.error("Checkout order error:", error);
    return NextResponse.json(
      { error: error?.message || "Unable to complete order checkout." },
      { status: 500 }
    );
  }
}
