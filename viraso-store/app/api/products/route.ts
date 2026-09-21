import { NextRequest, NextResponse } from "next/server";
import { getPublishedProducts, saveManagedProduct } from "@/lib/product-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET() {
  return NextResponse.json({ products: await getPublishedProducts() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const product = await saveManagedProduct(await request.json());
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save product." }, { status: 400 });
  }
}
