import { promises as fs } from "fs";
import path from "path";
import { listRegistrations } from "@/lib/product-registration-store";
import { getManagedProducts } from "@/lib/product-store";

export type WarrantyStatus = "Active" | "Expired" | "Cancelled";

export type WarrantyRecord = {
  id: string;
  registrationId: string;
  serialNumber: string;
  customerName: string;
  mobile: string;
  email: string;
  productName: string;
  productId: string;
  purchaseDate: string;
  registrationDate: string;
  warrantyPeriod: string;
  warrantyDurationMonths: number;
  expiryDate: string;
  status: WarrantyStatus;
  statusOverride?: WarrantyStatus;
  notes?: string;
  lastUpdated: string;
};

type WarrantyMetaStore = Record<
  string,
  {
    statusOverride?: WarrantyStatus;
    notes?: string;
    extendedMonths?: number;
    lastUpdated?: string;
  }
>;

const warrantyDir = path.join(process.cwd(), "data", "warranty");
const warrantyMetaFile = path.join(warrantyDir, "warranty-meta.json");

async function ensureStore() {
  await fs.mkdir(warrantyDir, { recursive: true });
  try {
    await fs.access(warrantyMetaFile);
  } catch {
    await fs.writeFile(warrantyMetaFile, "{}", "utf8");
  }
}

async function readWarrantyMeta(): Promise<WarrantyMetaStore> {
  await ensureStore();
  try {
    const raw = await fs.readFile(warrantyMetaFile, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeWarrantyMeta(meta: WarrantyMetaStore) {
  await ensureStore();
  await fs.writeFile(warrantyMetaFile, JSON.stringify(meta, null, 2), "utf8");
}

function parseWarrantyDurationMonths(warrantyString?: string): number {
  if (!warrantyString) return 12; // default 1 year
  const lower = warrantyString.toLowerCase();
  if (lower.includes("2 year") || lower.includes("2 yr") || lower.includes("24 month")) return 24;
  if (lower.includes("3 year") || lower.includes("3 yr") || lower.includes("36 month")) return 36;
  if (lower.includes("5 year") || lower.includes("5 yr")) return 60;
  if (lower.includes("6 month")) return 6;
  if (lower.includes("18 month")) return 18;
  if (lower.includes("1 year") || lower.includes("1 yr") || lower.includes("12 month")) return 12;

  // Try extracting number
  const match = lower.match(/(\d+)\s*(year|month|yr)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (match[2].startsWith("y")) return num * 12;
    return num;
  }
  return 12;
}

function addMonthsToDate(dateStr: string, months: number): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date(Date.now() + months * 30 * 86400000).toISOString().slice(0, 10);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export async function listWarranties(): Promise<WarrantyRecord[]> {
  const [registrations, products, meta] = await Promise.all([
    listRegistrations(false),
    getManagedProducts(),
    readWarrantyMeta(),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const todayStr = new Date().toISOString().slice(0, 10);

  return registrations.map((reg) => {
    const product = productMap.get(reg.productId);
    const pMeta = meta[reg.registrationId] || {};

    let warrantyText = product?.warranty || "";
    if (!warrantyText && product?.specifications) {
      const spec = product.specifications.find((s) => s.label.toLowerCase().includes("warranty"));
      if (spec) warrantyText = spec.value;
    }
    if (!warrantyText) warrantyText = "1 Year Brand Warranty";

    const baseMonths = parseWarrantyDurationMonths(warrantyText);
    const totalMonths = baseMonths + (pMeta.extendedMonths || 0);

    const purchaseDate = reg.purchaseDate || reg.registrationDate.slice(0, 10);
    const expiryDate = addMonthsToDate(purchaseDate, totalMonths);

    let status: WarrantyStatus = "Active";
    if (reg.status === "Cancelled" || reg.status === "Rejected") {
      status = "Cancelled";
    } else if (expiryDate && expiryDate < todayStr) {
      status = "Expired";
    }

    if (pMeta.statusOverride) {
      status = pMeta.statusOverride;
    }

    return {
      id: `WAR-${reg.registrationId}`,
      registrationId: reg.registrationId,
      serialNumber: reg.serialNumber,
      customerName: reg.customerName,
      mobile: reg.mobile,
      email: reg.email,
      productName: reg.productName,
      productId: reg.productId,
      purchaseDate,
      registrationDate: reg.registrationDate,
      warrantyPeriod: warrantyText,
      warrantyDurationMonths: totalMonths,
      expiryDate,
      status,
      statusOverride: pMeta.statusOverride,
      notes: pMeta.notes || "",
      lastUpdated: pMeta.lastUpdated || reg.updatedAt || reg.registrationDate,
    };
  });
}

export async function updateWarranty(input: {
  registrationId: string;
  statusOverride?: WarrantyStatus;
  notes?: string;
  extendedMonths?: number;
}) {
  const meta = await readWarrantyMeta();
  const existing = meta[input.registrationId] || {};

  meta[input.registrationId] = {
    ...existing,
    ...(input.statusOverride !== undefined ? { statusOverride: input.statusOverride } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.extendedMonths !== undefined ? { extendedMonths: input.extendedMonths } : {}),
    lastUpdated: new Date().toISOString(),
  };

  await writeWarrantyMeta(meta);
  const all = await listWarranties();
  return all.find((item) => item.registrationId === input.registrationId) ?? null;
}

export async function warrantyStats() {
  const warranties = await listWarranties();
  return {
    total: warranties.length,
    active: warranties.filter((w) => w.status === "Active").length,
    expired: warranties.filter((w) => w.status === "Expired").length,
    cancelled: warranties.filter((w) => w.status === "Cancelled").length,
  };
}
