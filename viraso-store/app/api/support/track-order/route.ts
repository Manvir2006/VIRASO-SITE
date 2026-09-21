import { NextRequest, NextResponse } from "next/server";
import { findOrder } from "@/lib/support-store";
import { getCourierByName, resolveTrackingUrl } from "@/lib/courier-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = (searchParams.get("orderNumber") || searchParams.get("orderId") || "").trim();
    const mobile = (searchParams.get("mobile") || searchParams.get("mobileNumber") || searchParams.get("mobileOrEmail") || "").trim();

    if (!orderNumber || !mobile) {
      return NextResponse.json(
        { error: "Order ID and mobile number are required." },
        { status: 400 }
      );
    }

    const order = await findOrder(orderNumber, mobile);

    if (!order) {
      return NextResponse.json(
        { error: "Order ID or mobile number is incorrect." },
        { status: 404 }
      );
    }

    let courierTrackingUrl: string | null = null;
    let courierPartnerName: string | null = order.courier || null;

    if (order.courier) {
      const courierPartner = await getCourierByName(order.courier);
      if (courierPartner) {
        courierPartnerName = courierPartner.name;
        courierTrackingUrl = resolveTrackingUrl(courierPartner, {
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber || "",
        });
      }
    }

    return NextResponse.json(
      {
        order: {
          ...order,
          courier: courierPartnerName,
          courierTrackingUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json({ error: "Unable to track order." }, { status: 500 });
  }
}
