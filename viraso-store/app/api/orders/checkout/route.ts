import { NextRequest, NextResponse } from "next/server";
import { createOrderRecord } from "@/lib/support-store";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerName, phone, address, items, totalAmount } = data || {};

    if (!customerName || !phone || !address) {
      return NextResponse.json({ error: "Customer name, phone, and address are required." }, { status: 400 });
    }

    const firstItem = items && items.length > 0 ? items[0] : null;
    const productName = firstItem ? firstItem.name : "Viraso Sewing Machine Component";
    const totalQuantity = items && items.length > 0 ? items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) : 1;

    const cfOrderId = `CF_ORD_${Date.now()}`;
    const cfPaymentId = `CF_PAY_${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    const order = await createOrderRecord({
      customerName: String(customerName),
      mobile: String(phone),
      email: data.email || "",
      product: productName,
      quantity: totalQuantity,
      totalAmount: totalAmount || (totalQuantity * 3499),
      items: items || [],
      shippingAddress: String(address),
      cashfreeOrderId: cfOrderId,
      cashfreePaymentId: cfPaymentId,
      paymentStatus: "Paid",
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Checkout order error:", error);
    return NextResponse.json({ error: "Unable to complete order checkout." }, { status: 500 });
  }
}
