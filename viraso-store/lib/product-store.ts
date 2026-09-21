import { promises as fs } from "fs";
import path from "path";
import { products as seedProducts, type Product } from "@/lib/products";

export type ProductStatus = "Published" | "Draft" | "Inactive";

export type ManagedProduct = Product & {
  modelName: string;
  subCategory: string;
  discount: number;
  colour: string;
  packageContents: string;
  shippingInformation: string;
  stockQuantity: number;
  publishStatus: ProductStatus;
  updatedAt?: string;
  createdAt?: string;
};

const dataDir = path.join(process.cwd(), "data", "products");
const productsFile = path.join(dataDir, "products.json");

function toManagedProduct(product: Product): ManagedProduct {
  return {
    ...product,
    modelName: product.sku,
    subCategory: product.category,
    discount: Math.max(product.mrp - product.price, 0),
    colour: "Not specified",
    packageContents: product.whatsIncluded || "Not specified",
    shippingInformation: "Contact support for shipping information",
    stockQuantity: product.stock.toLowerCase().includes("out") ? 0 : 1,
    publishStatus: "Published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(productsFile);
  } catch {
    await fs.writeFile(productsFile, JSON.stringify(seedProducts.map(toManagedProduct), null, 2), "utf8");
  }
}

async function readProducts() {
  await ensureStore();
  const raw = await fs.readFile(productsFile, "utf8");
  return (raw ? JSON.parse(raw) : []) as ManagedProduct[];
}

async function writeProducts(items: ManagedProduct[]) {
  await ensureStore();
  await fs.writeFile(productsFile, JSON.stringify(items, null, 2), "utf8");
}

export async function getManagedProducts() {
  return readProducts();
}

export async function getPublishedProducts() {
  return (await readProducts()).filter((product) => product.publishStatus === "Published");
}

export async function getManagedProductById(id: string) {
  return (await readProducts()).find((product) => product.id === id) ?? null;
}

export async function getManagedProductBySlug(slug: string) {
  return (await readProducts()).find((product) => product.slug === slug && product.publishStatus === "Published") ?? null;
}

export async function saveManagedProduct(input: Partial<ManagedProduct> & { id?: string }) {
  const items = await readProducts();
  const existing = input.id ? items.find((product) => product.id === input.id) : undefined;
  const base = existing || toManagedProduct(seedProducts[0]);
  const now = new Date().toISOString();

  const product: ManagedProduct = {
    ...base,
    ...input,
    id: existing?.id || input.id || `PROD-${Date.now()}`,
    slug: String(input.slug || existing?.slug || input.name || "product").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    sku: String(input.sku || existing?.sku || input.id || `SKU-${Date.now()}`),
    image: String(input.image || existing?.image || input.gallery?.[0] || ""),
    gallery: input.gallery?.length ? input.gallery : existing?.gallery || [],
    publishStatus: input.publishStatus || existing?.publishStatus || "Draft",
    stock: Number(input.stockQuantity ?? existing?.stockQuantity ?? 0) > 0 ? "In Stock" : "Out of Stock",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const next = existing ? items.map((item) => (item.id === product.id ? product : item)) : [product, ...items];
  await writeProducts(next);
  return product;
}

export async function deleteManagedProduct(id: string) {
  const items = await readProducts();
  await writeProducts(items.map((product) => product.id === id ? { ...product, publishStatus: "Inactive" as const, updatedAt: new Date().toISOString() } : product));
}

export async function removeManagedProduct(id: string) {
  const items = await readProducts();
  await writeProducts(items.filter((product) => product.id !== id));
}
