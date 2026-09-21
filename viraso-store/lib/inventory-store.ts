import { promises as fs } from "fs";
import path from "path";
import { getManagedProducts, saveManagedProduct } from "@/lib/product-store";
import { listOrders } from "@/lib/support-store";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type InventoryItem = {
  productId: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  lastUpdated: string;
};

export type StockAdjustmentType = "Add" | "Reduce" | "Set";

export type StockAdjustmentLog = {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  type: StockAdjustmentType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  admin: string;
  date: string;
};

type InventoryMetaStore = Record<string, { lowStockThreshold?: number; lastUpdated?: string }>;

const inventoryDir = path.join(process.cwd(), "data", "inventory");
const metaFile = path.join(inventoryDir, "inventory-meta.json");
const historyFile = path.join(inventoryDir, "history.json");

async function ensureInventoryStore() {
  await fs.mkdir(inventoryDir, { recursive: true });
  try {
    await fs.access(metaFile);
  } catch {
    await fs.writeFile(metaFile, "{}", "utf8");
  }
  try {
    await fs.access(historyFile);
  } catch {
    await fs.writeFile(historyFile, "[]", "utf8");
  }
}

async function readMeta(): Promise<InventoryMetaStore> {
  await ensureInventoryStore();
  try {
    const raw = await fs.readFile(metaFile, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeMeta(meta: InventoryMetaStore) {
  await ensureInventoryStore();
  await fs.writeFile(metaFile, JSON.stringify(meta, null, 2), "utf8");
}

export async function getInventoryHistory(): Promise<StockAdjustmentLog[]> {
  await ensureInventoryStore();
  try {
    const raw = await fs.readFile(historyFile, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeInventoryHistory(logs: StockAdjustmentLog[]) {
  await ensureInventoryStore();
  await fs.writeFile(historyFile, JSON.stringify(logs, null, 2), "utf8");
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const [products, orders, meta] = await Promise.all([
    getManagedProducts(),
    listOrders(),
    readMeta(),
  ]);

  // Calculate reserved stock for active unfulfilled orders
  const activeOrders = orders.filter((order) =>
    ["Pending", "Processing", "Confirmed", "Packed"].includes(order.status)
  );

  const reservedBySku = new Map<string, number>();
  for (const order of activeOrders) {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const key = (item.sku || item.name).toLowerCase();
        reservedBySku.set(key, (reservedBySku.get(key) || 0) + item.quantity);
      }
    } else if (order.product) {
      const key = order.product.toLowerCase();
      reservedBySku.set(key, (reservedBySku.get(key) || 0) + (order.quantity || 1));
    }
  }

  return products.map((product) => {
    const pMeta = meta[product.id] || {};
    const threshold = pMeta.lowStockThreshold !== undefined ? pMeta.lowStockThreshold : 5;
    const currentStock = Number(product.stockQuantity || 0);

    const matchKeyName = product.name.toLowerCase();
    const matchKeySku = product.sku.toLowerCase();
    const reservedStock =
      reservedBySku.get(matchKeySku) ||
      reservedBySku.get(matchKeyName) ||
      0;

    const availableStock = Math.max(0, currentStock - reservedStock);

    let stockStatus: StockStatus = "In Stock";
    if (availableStock <= 0) {
      stockStatus = "Out of Stock";
    } else if (availableStock <= threshold) {
      stockStatus = "Low Stock";
    }

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      currentStock,
      reservedStock,
      availableStock,
      lowStockThreshold: threshold,
      stockStatus,
      lastUpdated: pMeta.lastUpdated || product.updatedAt || new Date().toISOString(),
    };
  });
}

export async function adjustStock(input: {
  productId: string;
  type: StockAdjustmentType;
  quantity: number;
  reason: string;
  admin?: string;
}): Promise<InventoryItem | null> {
  const products = await getManagedProducts();
  const product = products.find((p) => p.id === input.productId);
  if (!product) return null;

  const previousStock = Number(product.stockQuantity || 0);
  let newStock = previousStock;

  if (input.type === "Add") {
    newStock = previousStock + Math.abs(input.quantity);
  } else if (input.type === "Reduce") {
    newStock = Math.max(0, previousStock - Math.abs(input.quantity));
  } else if (input.type === "Set") {
    newStock = Math.max(0, Math.round(input.quantity));
  }

  // Update product store
  await saveManagedProduct({
    ...product,
    stockQuantity: newStock,
    stock: newStock > 0 ? "In Stock" : "Out of Stock",
  });

  // Update inventory meta
  const meta = await readMeta();
  const now = new Date().toISOString();
  meta[product.id] = {
    ...meta[product.id],
    lastUpdated: now,
  };
  await writeMeta(meta);

  // Append history log
  const history = await getInventoryHistory();
  const log: StockAdjustmentLog = {
    id: `ADJ-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    type: input.type,
    quantity: input.quantity,
    previousStock,
    newStock,
    reason: input.reason || "Manual inventory adjustment",
    admin: input.admin || "Admin",
    date: now,
  };
  history.unshift(log);
  await writeInventoryHistory(history);

  const allItems = await getInventoryItems();
  return allItems.find((item) => item.productId === product.id) ?? null;
}

export async function updateLowStockThreshold(productId: string, threshold: number) {
  const meta = await readMeta();
  meta[productId] = {
    ...meta[productId],
    lowStockThreshold: Math.max(1, Math.round(threshold)),
    lastUpdated: new Date().toISOString(),
  };
  await writeMeta(meta);
  return true;
}
