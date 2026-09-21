import { promises as fs } from "fs";
import path from "path";
import { getPublishedProducts, type ManagedProduct } from "@/lib/product-store";

export type RegistrationStatus =
  | "Registered"
  | "Non-Registered"
  | "Verified"
  | "Under Review"
  | "Rejected"
  | "Cancelled";

export type ProductRegistration = {
  id: string;
  registrationId: string;
  serialNumber: string;
  customerName: string;
  mobile: string;
  email: string;
  pinCode: string;
  city: string;
  state: string;
  locality: string;
  purchaseDate: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  productId: string;
  productName: string;
  dealerName: string;
  dealerCity: string;
  registrationDate: string;
  status: RegistrationStatus;
  adminNotes: { note: string; admin: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  deletedAt?: string;
};

export type RegistrationInput = Omit<
  ProductRegistration,
  | "id"
  | "registrationId"
  | "categoryName"
  | "subcategoryId"
  | "subcategoryName"
  | "productName"
  | "registrationDate"
  | "status"
  | "adminNotes"
  | "createdAt"
  | "updatedAt"
>;

const dataDir = path.join(process.cwd(), "data", "product-registrations");
const registrationsFile = path.join(dataDir, "registrations.json");

const categoryId = (category: string) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function subcategoryForProduct(product: ManagedProduct) {
  const normalizedName = product.name.toLowerCase();
  if (normalizedName.includes("domestic")) return "Domestic";
  if (normalizedName.includes("umbrella") || normalizedName.includes("ta-1") || normalizedName.includes("ta1")) return "Umbrella / TA-1";
  if (normalizedName.includes("overlock")) return "Overlock";
  if (normalizedName.includes("industrial")) return "Industrial";
  if (product.category === "Replacement Belts") return "Replacement Belts";
  return product.category;
}

export async function getRegistrationOptions() {
  const products = await getPublishedProducts();
  const categories = new Map<string, { id: string; name: string }>();
  const subcategories = new Map<string, { id: string; categoryId: string; name: string }>();

  for (const product of products) {
    const category = { id: categoryId(product.category), name: product.category };
    categories.set(category.id, category);
    const subcategoryName = subcategoryForProduct(product);
    const subcategory = {
      id: `${category.id}-${categoryId(subcategoryName)}`,
      categoryId: category.id,
      name: subcategoryName,
    };
    subcategories.set(subcategory.id, subcategory);
  }

  return {
    categories: [...categories.values()],
    subcategories: [...subcategories.values()],
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryId: categoryId(product.category),
      subcategoryId: `${categoryId(product.category)}-${categoryId(subcategoryForProduct(product))}`,
    })),
  };
}

async function productById(productId: string) {
  return (await getPublishedProducts()).find((product) => product.id === productId) ?? null;
}

function registrationFromInput(input: RegistrationInput, product: ManagedProduct): ProductRegistration {
  const now = new Date().toISOString();
  const category = categoryId(product.category);
  const subcategory = subcategoryForProduct(product);
  return {
    ...input,
    id: `db-${crypto.randomUUID()}`,
    registrationId: "",
    categoryName: product.category,
    subcategoryId: `${category}-${categoryId(subcategory)}`,
    subcategoryName: subcategory,
    productName: product.name,
    registrationDate: now,
    status: "Registered",
    adminNotes: [],
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };
}

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(registrationsFile);
  } catch {
    await fs.writeFile(registrationsFile, "[]", "utf8");
  }
}

async function readRegistrations() {
  await ensureStore();
  const raw = await fs.readFile(registrationsFile, "utf8");
  return (raw ? JSON.parse(raw) : []) as ProductRegistration[];
}

async function writeRegistrations(registrations: ProductRegistration[]) {
  await ensureStore();
  await fs.writeFile(registrationsFile, JSON.stringify(registrations, null, 2), "utf8");
}

function nextRegistrationId(registrations: ProductRegistration[]) {
  const year = new Date().getFullYear();
  const prefix = `VR-${year}-`;
  const largest = registrations.reduce((max, registration) => {
    if (!registration.registrationId.startsWith(prefix)) return max;
    const value = Number(registration.registrationId.replace(prefix, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
  return `${prefix}${String(largest + 1).padStart(6, "0")}`;
}

export async function createRegistration(input: RegistrationInput) {
  const registrations = await readRegistrations();
  const serialNumber = input.serialNumber.trim().toUpperCase();
  const duplicate = registrations.find(
    (registration) =>
      !registration.isArchived &&
      registration.serialNumber.toUpperCase() === serialNumber &&
      registration.status !== "Cancelled"
  );
  if (duplicate) {
    throw new Error("This serial number is already registered. Please contact support if you believe this is an error.");
  }

  const product = await productById(input.productId);
  if (!product) throw new Error("Please select a valid product.");

  const registration = registrationFromInput({ ...input, serialNumber }, product);
  registration.registrationId = nextRegistrationId(registrations);
  registrations.unshift(registration);
  await writeRegistrations(registrations);
  return registration;
}

export async function listRegistrations(includeArchived = false) {
  const all = await readRegistrations();
  return includeArchived ? all : all.filter((item) => !item.isArchived);
}

export async function getRegistration(registrationId: string) {
  const registrations = await readRegistrations();
  return registrations.find((registration) => registration.registrationId === registrationId) ?? null;
}

export async function updateRegistration(registrationId: string, status: RegistrationStatus, note?: string, admin = "Admin") {
  const registrations = await readRegistrations();
  const registration = registrations.find((item) => item.registrationId === registrationId);
  if (!registration) return null;

  registration.status = status;
  registration.updatedAt = new Date().toISOString();
  if (note?.trim()) {
    registration.adminNotes.unshift({ note: note.trim(), admin, createdAt: registration.updatedAt });
  }
  await writeRegistrations(registrations);
  return registration;
}

export async function updateRegistrationDetails(
  registrationId: string,
  updates: Partial<ProductRegistration>,
  note?: string,
  admin = "Admin"
) {
  const registrations = await readRegistrations();
  const registration = registrations.find((item) => item.registrationId === registrationId);
  if (!registration) return null;

  Object.assign(registration, updates);
  registration.updatedAt = new Date().toISOString();
  if (note?.trim()) {
    registration.adminNotes.unshift({ note: note.trim(), admin, createdAt: registration.updatedAt });
  }
  await writeRegistrations(registrations);
  return registration;
}

export async function deleteRegistration(registrationId: string, reason?: string, admin = "Admin") {
  const registrations = await readRegistrations();
  const registration = registrations.find((item) => item.registrationId === registrationId);
  if (!registration) return false;

  registration.isArchived = true;
  registration.deletedAt = new Date().toISOString();
  registration.updatedAt = registration.deletedAt;
  if (reason) {
    registration.adminNotes.unshift({
      note: `Record archived: ${reason}`,
      admin,
      createdAt: registration.deletedAt,
    });
  }
  await writeRegistrations(registrations);
  return true;
}

export function filterRegistrations(registrations: ProductRegistration[], searchParams: URLSearchParams) {
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "";
  const product = searchParams.get("product") || "";
  const state = (searchParams.get("state") || "").trim().toLowerCase();
  const status = searchParams.get("status") || "";
  const registrationType = searchParams.get("type") || ""; // "Registered" | "Non-Registered"
  const purchaseDate = searchParams.get("purchaseDate") || "";
  const registrationDate = searchParams.get("registrationDate") || "";

  return registrations.filter((registration) => {
    const searchable = [
      registration.registrationId,
      registration.serialNumber,
      registration.customerName,
      registration.mobile,
      registration.email,
      registration.productName,
      registration.dealerName,
    ].join(" ").toLowerCase();

    const matchesType =
      !registrationType ||
      (registrationType === "Registered" && ["Registered", "Verified", "Under Review"].includes(registration.status)) ||
      (registrationType === "Non-Registered" && ["Non-Registered", "Cancelled", "Rejected"].includes(registration.status));

    return (
      (!search || searchable.includes(search)) &&
      (!category || registration.categoryId === category) &&
      (!product || registration.productId === product) &&
      (!state || registration.state.toLowerCase() === state) &&
      (!status || registration.status === status) &&
      matchesType &&
      (!purchaseDate || registration.purchaseDate === purchaseDate) &&
      (!registrationDate || registration.registrationDate.startsWith(registrationDate))
    );
  });
}

export async function registrationStats() {
  const registrations = await listRegistrations(false);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);
  const byDay = new Map<string, number>();

  let registeredCount = 0;
  let nonRegisteredCount = 0;

  for (const registration of registrations) {
    const day = registration.registrationDate.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);

    if (["Registered", "Verified", "Under Review"].includes(registration.status)) {
      registeredCount++;
    } else {
      nonRegisteredCount++;
    }
  }

  return {
    total: registrations.length,
    registered: registeredCount,
    nonRegistered: nonRegisteredCount,
    today: registrations.filter((item) => item.registrationDate.startsWith(today)).length,
    month: registrations.filter((item) => item.registrationDate.startsWith(month)).length,
    verified: registrations.filter((item) => item.status === "Verified").length,
    pending: registrations.filter((item) => item.status === "Under Review").length,
    chart: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, count]) => ({ date, count })),
  };
}

export function registrationsToCsv(registrations: ProductRegistration[]) {
  const headers = ["Registration ID", "Serial Number", "Customer Name", "Mobile", "Email", "Product", "Category", "Purchase Date", "Dealer/Seller", "Registration Date", "Status"];
  const rows = registrations.map((item) => [item.registrationId, item.serialNumber, item.customerName, item.mobile, item.email, item.productName, item.categoryName, item.purchaseDate, item.dealerName, item.registrationDate, item.status]);
  return [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
}
