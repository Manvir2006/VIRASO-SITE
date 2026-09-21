import { promises as fs } from "fs";
import path from "path";

export type B2BInquiryStatus =
  | "New"
  | "Contacted"
  | "Quotation Sent"
  | "Negotiation"
  | "Converted"
  | "Closed"
  | "Not Interested";

export type PurchaseFrequency =
  | "One Time"
  | "Monthly"
  | "Quarterly"
  | "Regular Bulk Purchase";

export type B2BInquiryRecord = {
  id: string;
  inquiry_number: string;
  company_name: string;
  gst_number?: string;
  company_address: string;
  city: string;
  state: string;
  pin_code: string;
  website?: string;
  contact_person_name: string;
  mobile: string;
  whatsapp_number?: string;
  email: string;
  monthly_quantity: string;
  product_requirement: string;
  purchase_frequency: PurchaseFrequency;
  additional_message?: string;
  status: B2BInquiryStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  deleted_at?: string;
  linked_customer_id?: string;
};

const dataDir = path.join(process.cwd(), "data", "b2b");
const inquiriesFile = path.join(dataDir, "inquiries.json");

const seedInquiries: B2BInquiryRecord[] = [
  {
    id: "b2b_seed_1",
    inquiry_number: "B2B-2026-00001",
    company_name: "Apex Garments & Textile Pvt Ltd",
    gst_number: "07AAACA1234A1Z5",
    company_address: "Plot 42, Industrial Area Phase 2, Okhla",
    city: "New Delhi",
    state: "Delhi",
    pin_code: "110020",
    website: "https://apexgarments.example.com",
    contact_person_name: "Rajesh Singhania",
    mobile: "9811223344",
    whatsapp_number: "9811223344",
    email: "procurement@apexgarments.example.com",
    monthly_quantity: "150 Units",
    product_requirement: "Viraso Heavy-Duty Sewing Machine Stand with balance wheel & foot treadle - 100 pcs/month\nViraso Universal Motor Stand Attachments - 50 pcs/month",
    purchase_frequency: "Monthly",
    additional_message: "Requires heavy carton export grade packaging and delivery to our Okhla processing unit. Need GST invoice with input tax credit.",
    status: "Quotation Sent",
    admin_notes: "Initial quote sent on 18 Sept. Follow up scheduled for next Tuesday regarding bulk delivery batch.",
    created_at: "2026-09-18T10:30:00.000Z",
    updated_at: "2026-09-19T14:20:00.000Z",
    is_archived: false,
  },
  {
    id: "b2b_seed_2",
    inquiry_number: "B2B-2026-00002",
    company_name: "Ludhiana Stitchcraft Hub",
    gst_number: "03AAAPL9876P1Z2",
    company_address: "Shop 14-16, Guru Nanak Market, Gill Road",
    city: "Ludhiana",
    state: "Punjab",
    pin_code: "141003",
    website: "",
    contact_person_name: "Gurpreet Singh",
    mobile: "9872345678",
    whatsapp_number: "9872345678",
    email: "gurpreet.stitchcraft@gmail.com",
    monthly_quantity: "50 Units",
    product_requirement: "Viraso Umbrella/TA-1 Sewing Machine Stand & Table with Belt - 50 units. Want custom branding if possible.",
    purchase_frequency: "Regular Bulk Purchase",
    additional_message: "Local pickup available from factory or require transport dispatch via Ludhiana transport union.",
    status: "New",
    admin_notes: "New inquiry received. Needs call back to discuss local dispatch arrangements.",
    created_at: "2026-09-21T08:15:00.000Z",
    updated_at: "2026-09-21T08:15:00.000Z",
    is_archived: false,
  },
];

async function ensureStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(inquiriesFile);
  } catch {
    await fs.writeFile(inquiriesFile, JSON.stringify(seedInquiries, null, 2), "utf8");
  }
}

async function readInquiries(): Promise<B2BInquiryRecord[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(inquiriesFile, "utf8");
    if (!raw) return seedInquiries;
    return JSON.parse(raw) as B2BInquiryRecord[];
  } catch {
    return seedInquiries;
  }
}

async function writeInquiries(items: B2BInquiryRecord[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(inquiriesFile, JSON.stringify(items, null, 2), "utf8");
}

export function validateGSTIN(gstin?: string): { valid: boolean; error?: string } {
  if (!gstin || !gstin.trim()) return { valid: true };
  const cleaned = gstin.trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(cleaned)) {
    return {
      valid: false,
      error: "Please enter a valid 15-character GSTIN (e.g. 07AAAAA0000A1Z5) or leave blank if not available.",
    };
  }
  return { valid: true };
}

export function generateInquiryNumber(existing: B2BInquiryRecord[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  const prefix = `B2B-${currentYear}-`;

  for (const item of existing) {
    if (item.inquiry_number && item.inquiry_number.startsWith(prefix)) {
      const numPart = parseInt(item.inquiry_number.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(5, "0");
  return `${prefix}${padded}`;
}

export async function listB2BInquiries(includeArchived = false): Promise<B2BInquiryRecord[]> {
  const items = await readInquiries();
  const filtered = includeArchived ? items : items.filter((i) => !i.is_archived);
  return filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getB2BInquiryById(idOrNumber: string): Promise<B2BInquiryRecord | null> {
  const items = await readInquiries();
  const normalized = idOrNumber.trim().toUpperCase();
  return (
    items.find(
      (i) =>
        i.id.toUpperCase() === normalized ||
        i.inquiry_number.toUpperCase() === normalized
    ) ?? null
  );
}

export async function createB2BInquiry(input: {
  company_name: string;
  gst_number?: string;
  company_address: string;
  city: string;
  state: string;
  pin_code: string;
  website?: string;
  contact_person_name: string;
  mobile: string;
  whatsapp_number?: string;
  email: string;
  monthly_quantity: string;
  product_requirement: string;
  purchase_frequency?: PurchaseFrequency;
  additional_message?: string;
}): Promise<B2BInquiryRecord> {
  const items = await readInquiries();
  const now = new Date().toISOString();
  const inquiryNumber = generateInquiryNumber(items);

  const cleanGst = input.gst_number?.trim().toUpperCase();
  if (cleanGst) {
    const gstCheck = validateGSTIN(cleanGst);
    if (!gstCheck.valid) {
      throw new Error(gstCheck.error);
    }
  }

  const newRecord: B2BInquiryRecord = {
    id: `b2b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    inquiry_number: inquiryNumber,
    company_name: input.company_name.trim(),
    gst_number: cleanGst || undefined,
    company_address: input.company_address.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    pin_code: input.pin_code.trim(),
    website: input.website?.trim() || undefined,
    contact_person_name: input.contact_person_name.trim(),
    mobile: input.mobile.trim(),
    whatsapp_number: input.whatsapp_number?.trim() || input.mobile.trim(),
    email: input.email.trim().toLowerCase(),
    monthly_quantity: input.monthly_quantity.trim(),
    product_requirement: input.product_requirement.trim(),
    purchase_frequency: input.purchase_frequency || "Regular Bulk Purchase",
    additional_message: input.additional_message?.trim() || undefined,
    status: "New",
    admin_notes: "",
    created_at: now,
    updated_at: now,
    is_archived: false,
  };

  items.unshift(newRecord);
  await writeInquiries(items);
  return newRecord;
}

export async function updateB2BInquiry(
  id: string,
  updates: Partial<B2BInquiryRecord>
): Promise<B2BInquiryRecord | null> {
  const items = await readInquiries();
  const index = items.findIndex(
    (i) => i.id === id || i.inquiry_number.toUpperCase() === id.trim().toUpperCase()
  );
  if (index === -1) return null;

  if (updates.gst_number) {
    const gstCheck = validateGSTIN(updates.gst_number);
    if (!gstCheck.valid) {
      throw new Error(gstCheck.error);
    }
  }

  const current = items[index];
  const updated: B2BInquiryRecord = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  items[index] = updated;
  await writeInquiries(items);
  return updated;
}

export async function deleteB2BInquiry(id: string, reason?: string): Promise<boolean> {
  const items = await readInquiries();
  const index = items.findIndex(
    (i) => i.id === id || i.inquiry_number.toUpperCase() === id.trim().toUpperCase()
  );
  if (index === -1) return false;

  const now = new Date().toISOString();
  // Soft delete with archive flag
  items[index] = {
    ...items[index],
    is_archived: true,
    deleted_at: now,
    admin_notes: reason
      ? `${items[index].admin_notes}\n[Archived on ${now}: ${reason}]`.trim()
      : items[index].admin_notes,
    updated_at: now,
  };

  await writeInquiries(items);
  return true;
}

export async function getB2BStats(): Promise<{
  total: number;
  newCount: number;
  contacted: number;
  quotationSent: number;
  negotiation: number;
  converted: number;
  closed: number;
  notInterested: number;
}> {
  const items = await listB2BInquiries(false);
  return {
    total: items.length,
    newCount: items.filter((i) => i.status === "New").length,
    contacted: items.filter((i) => i.status === "Contacted").length,
    quotationSent: items.filter((i) => i.status === "Quotation Sent").length,
    negotiation: items.filter((i) => i.status === "Negotiation").length,
    converted: items.filter((i) => i.status === "Converted").length,
    closed: items.filter((i) => i.status === "Closed").length,
    notInterested: items.filter((i) => i.status === "Not Interested").length,
  };
}
