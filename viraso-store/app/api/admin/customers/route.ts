import { NextRequest, NextResponse } from "next/server";
import { getCustomers, getCustomerById } from "@/lib/customer-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const customer = await getCustomerById(id);
    return customer
      ? NextResponse.json({ customer })
      : NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const search = searchParams.get("search") || "";
  const customers = await getCustomers(search);
  return NextResponse.json({ customers });
}
