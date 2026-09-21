import { NextRequest, NextResponse } from "next/server";
import {
  getInventoryItems,
  adjustStock,
  updateLowStockThreshold,
  getInventoryHistory,
  type StockAdjustmentType,
} from "@/lib/inventory-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const items = await getInventoryItems();
  const history = await getInventoryHistory();

  const stats = {
    totalItems: items.length,
    lowStockItems: items.filter((i) => i.stockStatus === "Low Stock").length,
    outOfStockItems: items.filter((i) => i.stockStatus === "Out of Stock").length,
    totalStockUnits: items.reduce((acc, i) => acc + i.currentStock, 0),
    totalAvailableUnits: items.reduce((acc, i) => acc + i.availableStock, 0),
  };

  return NextResponse.json({ items, history, stats });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { productId, type, quantity, reason, admin } = body || {};

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID, adjustment type (Add/Reduce/Set), and quantity are required." },
        { status: 400 }
      );
    }

    const updatedItem = await adjustStock({
      productId,
      type: type as StockAdjustmentType,
      quantity: Number(quantity),
      reason: reason || "Manual adjustment",
      admin: admin || "Admin",
    });

    if (!updatedItem) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Inventory adjustment error:", error);
    return NextResponse.json({ error: "Failed to adjust inventory." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  try {
    const body = await request.json();
    const { productId, threshold } = body || {};

    if (!productId || threshold === undefined) {
      return NextResponse.json({ error: "Product ID and threshold value are required." }, { status: 400 });
    }

    await updateLowStockThreshold(productId, Number(threshold));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Inventory threshold update error:", error);
    return NextResponse.json({ error: "Failed to update threshold." }, { status: 500 });
  }
}
