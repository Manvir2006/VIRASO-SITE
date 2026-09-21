import { promises as fs } from "fs";
import path from "path";
import {
  CourierIdentifierType,
  CourierPartner,
  validateCourierUrl,
  resolveTrackingUrl,
} from "./courier-utils";

export type { CourierIdentifierType, CourierPartner };
export { validateCourierUrl, resolveTrackingUrl };

const dataDir = path.join(process.cwd(), "data", "couriers");
const couriersFile = path.join(dataDir, "couriers.json");

const defaultCouriers: CourierPartner[] = [
  {
    id: "cour-ekart",
    name: "Ekart",
    tracking_url: "https://www.ekartlogistics.com/ekartlogistics-web/shipmenttrack/{TRACKING_ID}",
    url_type: "courier_awb",
    identifier_type: "courier_awb",
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cour-delhivery",
    name: "Delhivery",
    tracking_url: "https://www.delhivery.com/track-v2/package/{TRACKING_ID}",
    url_type: "courier_awb",
    identifier_type: "courier_awb",
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cour-shadowfax",
    name: "Shadowfax",
    tracking_url: "https://www.shadowfax.in/track",
    url_type: "page_only",
    identifier_type: "page_only",
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cour-bluedart",
    name: "Blue Dart",
    tracking_url: "https://www.bluedart.com/tracking/{TRACKING_ID}",
    url_type: "courier_awb",
    identifier_type: "courier_awb",
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cour-dtdc",
    name: "DTDC",
    tracking_url: "https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno={TRACKING_ID}",
    url_type: "courier_awb",
    identifier_type: "courier_awb",
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cour-indiapost",
    name: "India Post",
    tracking_url: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
    url_type: "page_only",
    identifier_type: "page_only",
    is_active: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(couriersFile);
  } catch {
    await fs.writeFile(couriersFile, JSON.stringify(defaultCouriers, null, 2), "utf8");
  }
}

async function readCouriers(): Promise<CourierPartner[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(couriersFile, "utf8");
    if (!raw) return defaultCouriers;
    const parsed = JSON.parse(raw) as CourierPartner[];
    // Normalize identifier_type
    return parsed.map((item) => {
      let idType: CourierIdentifierType = item.identifier_type || item.url_type;
      if (idType as string === "tracking_id_url") idType = "courier_awb";
      if (idType as string === "open_page_only") idType = "page_only";
      return {
        ...item,
        url_type: idType,
        identifier_type: idType,
      };
    });
  } catch {
    return defaultCouriers;
  }
}

async function writeCouriers(items: CourierPartner[]) {
  await ensureStore();
  await fs.writeFile(couriersFile, JSON.stringify(items, null, 2), "utf8");
}

export async function listCouriers(onlyActive = false): Promise<CourierPartner[]> {
  const couriers = await readCouriers();
  const sorted = couriers.sort((a, b) => a.display_order - b.display_order);
  return onlyActive ? sorted.filter((c) => c.is_active) : sorted;
}

export async function getCourierById(id: string): Promise<CourierPartner | null> {
  const couriers = await readCouriers();
  return couriers.find((c) => c.id === id) ?? null;
}

export async function getCourierByName(name: string): Promise<CourierPartner | null> {
  const couriers = await readCouriers();
  const normalized = name.trim().toLowerCase();
  return couriers.find((c) => c.name.trim().toLowerCase() === normalized) ?? null;
}

export async function saveCourier(input: {
  id?: string;
  name: string;
  tracking_url: string;
  url_type?: CourierIdentifierType;
  identifier_type?: CourierIdentifierType;
  logo_url?: string;
  is_active?: boolean;
  display_order?: number;
}): Promise<CourierPartner> {
  const validation = validateCourierUrl(input.tracking_url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const couriers = await readCouriers();
  const now = new Date().toISOString();
  const resolvedType = input.identifier_type || input.url_type || "courier_awb";

  if (input.id) {
    const index = couriers.findIndex((c) => c.id === input.id);
    if (index === -1) {
      throw new Error("Courier not found.");
    }
    const updated: CourierPartner = {
      ...couriers[index],
      name: input.name.trim(),
      tracking_url: input.tracking_url.trim(),
      url_type: resolvedType,
      identifier_type: resolvedType,
      logo_url: input.logo_url?.trim() || undefined,
      is_active: input.is_active !== undefined ? input.is_active : couriers[index].is_active,
      display_order: input.display_order !== undefined ? input.display_order : couriers[index].display_order,
      updated_at: now,
    };
    couriers[index] = updated;
    await writeCouriers(couriers);
    return updated;
  }

  // Create new
  const duplicate = couriers.find(
    (c) => c.name.trim().toLowerCase() === input.name.trim().toLowerCase()
  );
  if (duplicate) {
    throw new Error(`A courier named "${input.name}" already exists.`);
  }

  const maxOrder = couriers.reduce((max, c) => Math.max(max, c.display_order || 0), 0);
  const newCourier: CourierPartner = {
    id: `cour-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    tracking_url: input.tracking_url.trim(),
    url_type: resolvedType,
    identifier_type: resolvedType,
    logo_url: input.logo_url?.trim() || undefined,
    is_active: input.is_active !== undefined ? input.is_active : true,
    display_order: input.display_order !== undefined ? input.display_order : maxOrder + 1,
    created_at: now,
    updated_at: now,
  };

  couriers.push(newCourier);
  await writeCouriers(couriers);
  return newCourier;
}

export async function deleteCourier(id: string): Promise<boolean> {
  const couriers = await readCouriers();
  const index = couriers.findIndex((c) => c.id === id);
  if (index === -1) return false;

  // Soft-delete / deactivate
  couriers[index].is_active = false;
  couriers[index].updated_at = new Date().toISOString();
  await writeCouriers(couriers);
  return true;
}

export async function reorderCouriers(orderedIds: string[]): Promise<CourierPartner[]> {
  const couriers = await readCouriers();
  const updated = couriers.map((courier) => {
    const idx = orderedIds.indexOf(courier.id);
    if (idx !== -1) {
      return { ...courier, display_order: idx + 1, updated_at: new Date().toISOString() };
    }
    return courier;
  });
  const sorted = updated.sort((a, b) => a.display_order - b.display_order);
  await writeCouriers(sorted);
  return sorted;
}
