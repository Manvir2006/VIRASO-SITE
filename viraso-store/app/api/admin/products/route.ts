import { NextRequest, NextResponse } from "next/server";
import {
  deleteManagedProduct,
  removeManagedProduct,
  getManagedProducts,
  getManagedProductById,
  saveManagedProduct,
} from "@/lib/product-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const product = await getManagedProductById(id);
    return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ products: await getManagedProducts() });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const product = await saveManagedProduct(await request.json());
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Save product error:", error);
    return NextResponse.json({ error: "Failed to save product." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const product = await saveManagedProduct(await request.json());
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const permanent = url.searchParams.get("permanent") === "true";
    if (!id) return NextResponse.json({ error: "Product ID is required." }, { status: 400 });

    if (permanent) {
      await removeManagedProduct(id);
    } else {
      await deleteManagedProduct(id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
