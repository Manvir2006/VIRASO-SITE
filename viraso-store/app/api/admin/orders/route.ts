import { NextRequest, NextResponse } from "next/server";
import {
  listOrders,
  getOrderByNumber,
  updateOrder,
  createOrderRecord,
  deleteOrder,
} from "@/lib/support-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const order = await getOrderByNumber(orderNumber);
    return order
      ? NextResponse.json({ order })
      : NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const status = searchParams.get("status");
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  let orders = await listOrders(false);

  if (status) {
    if (status === "Pending") {
      orders = orders.filter((o) => ["Pending", "Confirmed", "Processing", "Packed"].includes(o.status));
    } else {
      orders = orders.filter((o) => o.status === status);
    }
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.mobile.includes(search) ||
        o.email.toLowerCase().includes(search) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search)) ||
        (o.cashfreeOrderId && o.cashfreeOrderId.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    if (!body.customerName || !body.mobile || !body.product) {
      return NextResponse.json({ error: "Customer name, mobile, and product are required." }, { status: 400 });
    }

    const order = await createOrderRecord(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Admin create order error:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    if (!body.orderNumber) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }

    const order = await updateOrder(body.orderNumber, body);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const reason = searchParams.get("reason") || "Cancelled by administrator";

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }

    const ok = await deleteOrder(orderNumber, reason);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("Admin delete order error:", error);
    return NextResponse.json({ error: "Failed to delete order." }, { status: 500 });
  }
}
