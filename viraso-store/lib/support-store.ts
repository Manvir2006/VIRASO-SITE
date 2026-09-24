import { promises as fs } from "fs";
import path from "path";

export type ComplaintStatus =
  | "New"
  | "Under Review"
  | "Need More Information"
  | "Approved"
  | "Rejected"
  | "Resolved";

export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Read";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Refunded";

export type ComplaintRecord = {
  id: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  orderNumber: string;
  productName: string;
  productIdSku: string;
  purchaseDate: string;
  complaintType: string;
  complaintDescription: string;
  productImageUrl?: string;
  invoiceUrl?: string;
  preferredContactMethod: string;
  submittedAt: string;
  status: ComplaintStatus;
  internalNotes: string;
  isArchived?: boolean;
  deletedAt?: string;
  updatedAt?: string;
};

export type ContactEnquiry = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
  internalNotes: string;
  isArchived?: boolean;
  deletedAt?: string;
  updatedAt?: string;
};

export type OrderItem = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  image?: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  mobile: string;
  product: string;
  quantity: number;
  orderDate: string;
  paymentStatus: string;
  shippingStatus: string;
  status: OrderStatus;
  timeline: string[];
  totalAmount?: number;
  items?: OrderItem[];
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  trackingNumber?: string;
  courier?: string;
  courierReference?: string;
  shippingDate?: string;
  shippingAddress?: string;
  billingAddress?: string;
  internalNotes?: string;
  isArchived?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

const supportBaseDir = path.join(process.cwd(), "data", "support");
const complaintsFile = path.join(supportBaseDir, "complaints.json");
const enquiriesFile = path.join(supportBaseDir, "enquiries.json");
const ordersFile = path.join(supportBaseDir, "orders.json");

const complaintSeed: ComplaintRecord[] = [];
const enquirySeed: ContactEnquiry[] = [];
const orderSeed: OrderRecord[] = [
  {
    id: "ORD-1001",
    orderNumber: "VIR12345",
    customerName: "Aarav Sharma",
    email: "aarav@example.com",
    mobile: "9876543210",
    product: "Viraso Domestic Sewing Machine Stand & Table with Belt",
    quantity: 1,
    totalAmount: 3499,
    orderDate: "2026-09-01",
    paymentStatus: "Paid",
    shippingStatus: "In transit",
    status: "Shipped",
    courier: "Delhivery",
    trackingNumber: "DL984712039",
    cashfreeOrderId: "CF_ORD_981203",
    cashfreePaymentId: "CF_PAY_981203",
    shippingAddress: "#12, Green Avenue, Ludhiana, Punjab 141001",
    timeline: [
      "Order Placed",
      "Payment Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ],
  },
  {
    id: "ORD-1002",
    orderNumber: "VIR12346",
    customerName: "Neha Verma",
    email: "neha@example.com",
    mobile: "9876543211",
    product: "Viraso Umbrella/TA-1 Sewing Machine Stand & Table with Belt",
    quantity: 2,
    totalAmount: 7398,
    orderDate: "2026-09-08",
    paymentStatus: "Paid",
    shippingStatus: "Processing",
    status: "Processing",
    courier: "Blue Dart",
    cashfreeOrderId: "CF_ORD_981204",
    cashfreePaymentId: "CF_PAY_981204",
    shippingAddress: "Flat 302, Sunrise Towers, Model Town, Ludhiana, Punjab",
    timeline: [
      "Order Placed",
      "Payment Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ],
  },
];

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

async function exists(pathName: string) {
  try {
    await fs.access(pathName);
    return true;
  } catch {
    return false;
  }
}

async function ensureDataFiles() {
  await fs.mkdir(supportBaseDir, { recursive: true });

  if (!(await exists(complaintsFile))) {
    await fs.writeFile(complaintsFile, JSON.stringify(complaintSeed, null, 2), "utf8");
  }

  if (!(await exists(enquiriesFile))) {
    await fs.writeFile(enquiriesFile, JSON.stringify(enquirySeed, null, 2), "utf8");
  }

  if (!(await exists(ordersFile))) {
    await fs.writeFile(ordersFile, JSON.stringify(orderSeed, null, 2), "utf8");
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDataFiles();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, value: T) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function saveUploadedFile(file: File, folder: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const uploadDir = path.join(process.cwd(), "public", "support", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });
  const destination = path.join(uploadDir, `${Date.now()}-${safeName}`);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destination, bytes);
  return `/support/uploads/${folder}/${path.basename(destination)}`;
}

// ----------------------------------------------------
// COMPLAINTS
// ----------------------------------------------------
export async function listComplaints(includeArchived = false) {
  const records = await readJson<ComplaintRecord[]>(complaintsFile, complaintSeed);
  return includeArchived ? records : records.filter((item) => !item.isArchived);
}

export async function getComplaintById(complaintId: string) {
  const records = await listComplaints(true);
  const normalizedId = complaintId.trim().toUpperCase().replace(/\s+/g, "");
  return (
    records.find((item) => {
      const currentId = item.id.trim().toUpperCase().replace(/\s+/g, "");
      return currentId === normalizedId || currentId.endsWith(normalizedId);
    }) ?? null
  );
}

export async function findComplaint(complaintId: string, mobileOrLookup?: string) {
  const complaint = await getComplaintById(complaintId);
  if (!complaint) return null;

  if (mobileOrLookup && mobileOrLookup.trim()) {
    const cleanMobileDigits = mobileOrLookup.replace(/[^0-9]/g, "").slice(-10);
    const itemMobileDigits = complaint.mobileNumber.replace(/[^0-9]/g, "").slice(-10);
    const matchMobile =
      cleanMobileDigits.length >= 10 && itemMobileDigits === cleanMobileDigits;
    const matchEmail =
      complaint.email.trim().toLowerCase() === mobileOrLookup.trim().toLowerCase();

    if (!matchMobile && !matchEmail) {
      return null;
    }
  }

  return complaint;
}

export async function createComplaint(input: Omit<ComplaintRecord, "id" | "status" | "internalNotes" | "submittedAt"> & { productImageUrl?: string; invoiceUrl?: string }) {
  const records = await listComplaints(true);
  const complaint: ComplaintRecord = {
    ...input,
    id: makeId("VC"),
    status: "New",
    submittedAt: new Date().toISOString(),
    internalNotes: "",
    isArchived: false,
  };
  records.unshift(complaint);
  await writeJson(complaintsFile, records);
  return complaint;
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus, internalNotes?: string) {
  const records = await listComplaints(true);
  const updated = records.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      internalNotes: internalNotes !== undefined ? internalNotes : item.internalNotes,
      updatedAt: new Date().toISOString(),
    };
  });
  await writeJson(complaintsFile, updated);
  return updated.find((item) => item.id === id) ?? null;
}

export async function deleteComplaint(id: string) {
  const records = await listComplaints(true);
  const updated = records.map((item) => {
    if (item.id === id) {
      return { ...item, isArchived: true, deletedAt: new Date().toISOString() };
    }
    return item;
  });
  await writeJson(complaintsFile, updated);
  return true;
}

// ----------------------------------------------------
// ENQUIRIES
// ----------------------------------------------------
export async function listEnquiries(includeArchived = false) {
  const records = await readJson<ContactEnquiry[]>(enquiriesFile, enquirySeed);
  return includeArchived ? records : records.filter((item) => !item.isArchived);
}

export async function createEnquiry(input: Omit<ContactEnquiry, "id" | "status" | "internalNotes" | "createdAt">) {
  const records = await listEnquiries(true);
  const enquiry: ContactEnquiry = {
    ...input,
    id: makeId("ENQ"),
    status: "New",
    internalNotes: "",
    createdAt: new Date().toISOString(),
    isArchived: false,
  };
  records.unshift(enquiry);
  await writeJson(enquiriesFile, records);
  return enquiry;
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus, internalNotes?: string) {
  const records = await listEnquiries(true);
  const updated = records.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      internalNotes: internalNotes !== undefined ? internalNotes : item.internalNotes,
      updatedAt: new Date().toISOString(),
    };
  });
  await writeJson(enquiriesFile, updated);
  return updated.find((item) => item.id === id) ?? null;
}

export async function deleteEnquiry(id: string) {
  const records = await listEnquiries(true);
  const updated = records.map((item) => {
    if (item.id === id) {
      return { ...item, isArchived: true, deletedAt: new Date().toISOString() };
    }
    return item;
  });
  await writeJson(enquiriesFile, updated);
  return true;
}

// ----------------------------------------------------
// ORDERS
// ----------------------------------------------------
export async function listOrders(includeArchived = false) {
  const orders = await readJson<OrderRecord[]>(ordersFile, orderSeed);
  return includeArchived ? orders : orders.filter((order) => !order.isArchived);
}

export async function findOrder(orderNumber: string, mobileOrLookup: string) {
  const orders = await listOrders(false);
  const normalizedOrder = orderNumber.trim().toUpperCase().replace(/\s+/g, "");
  const normalizedLookup = mobileOrLookup.trim().toLowerCase();
  const cleanMobileDigits = mobileOrLookup.replace(/[^0-9]/g, "").slice(-10);

  return orders.find((order) => {
    const matchesOrder = order.orderNumber.trim().toUpperCase().replace(/\s+/g, "") === normalizedOrder;
    if (!matchesOrder) return false;

    const orderMobileDigits = order.mobile.replace(/[^0-9]/g, "").slice(-10);
    const matchesMobile =
      (cleanMobileDigits.length === 10 && orderMobileDigits === cleanMobileDigits) ||
      order.mobile.trim().toLowerCase() === normalizedLookup ||
      order.email.trim().toLowerCase() === normalizedLookup;

    return matchesMobile;
  }) ?? null;
}

export async function getOrderByNumber(orderNumber: string) {
  const orders = await listOrders(true);
  return orders.find((order) => order.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase()) ?? null;
}

export async function getOrderByCashfreeId(cashfreeOrderId: string) {
  const orders = await listOrders(true);
  const clean = cashfreeOrderId.trim();
  return orders.find((order) => order.cashfreeOrderId === clean) ?? null;
}

export async function markOrderAsPaid(
  lookupId: string,
  cashfreePaymentId?: string
) {
  const orders = await listOrders(true);
  const clean = lookupId.trim();
  const order = orders.find(
    (o) => o.orderNumber.toUpperCase() === clean.toUpperCase() || o.cashfreeOrderId === clean
  );
  if (!order) return null;

  return updateOrder(order.orderNumber, {
    paymentStatus: "Paid",
    status: order.status === "Pending" ? "Processing" : order.status,
    cashfreePaymentId: cashfreePaymentId || order.cashfreePaymentId || "",
  });
}

export async function createOrderRecord(input: {
  customerName: string;
  email: string;
  mobile: string;
  product: string;
  quantity: number;
  totalAmount?: number;
  items?: OrderItem[];
  shippingAddress?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paymentStatus?: string;
}) {
  const orders = await listOrders(true);
  const orderCount = orders.length + 1;
  const orderNumber = `VIR${12340 + orderCount}`;
  const now = new Date().toISOString();

  const newOrder: OrderRecord = {
    id: `ORD-${Date.now()}`,
    orderNumber,
    customerName: input.customerName,
    email: input.email,
    mobile: input.mobile,
    product: input.product,
    quantity: input.quantity,
    totalAmount: input.totalAmount || 0,
    items: input.items || [],
    shippingAddress: input.shippingAddress || "",
    cashfreeOrderId: input.cashfreeOrderId || `CF_ORD_${Date.now()}`,
    cashfreePaymentId: input.cashfreePaymentId || "",
    paymentStatus: input.paymentStatus || "Paid",
    shippingStatus: "Pending",
    status: "Pending",
    orderDate: now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
    timeline: [
      "Order Placed",
      "Payment Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ],
    isArchived: false,
  };

  orders.unshift(newOrder);
  await writeJson(ordersFile, orders);
  return newOrder;
}

export async function updateOrder(orderNumber: string, updates: Partial<OrderRecord>) {
  const records = await listOrders(true);
  const now = new Date().toISOString();
  let updatedOrder: OrderRecord | null = null;

  const updated = records.map((item) => {
    if (item.orderNumber.toUpperCase() !== orderNumber.trim().toUpperCase()) return item;

    const nextStatus = (updates.status || item.status) as OrderStatus;
    let shippingStatus = item.shippingStatus;
    if (updates.shippingStatus) {
      shippingStatus = updates.shippingStatus;
    } else if (nextStatus === "Delivered") {
      shippingStatus = "Delivered";
    } else if (nextStatus === "Cancelled") {
      shippingStatus = "Cancelled";
    } else if (["Shipped", "Out for Delivery"].includes(nextStatus)) {
      shippingStatus = "In transit";
    } else if (nextStatus === "Packed") {
      shippingStatus = "Ready to ship";
    } else if (nextStatus === "Processing") {
      shippingStatus = "Processing";
    }

    updatedOrder = {
      ...item,
      ...updates,
      shippingStatus,
      status: nextStatus,
      updatedAt: now,
    };
    return updatedOrder;
  });

  await writeJson(ordersFile, updated);
  return updatedOrder;
}

export async function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  return updateOrder(orderNumber, { status });
}

export async function deleteOrder(orderNumber: string, reason?: string) {
  const records = await listOrders(true);
  const updated = records.map((item) => {
    if (item.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase()) {
      return {
        ...item,
        status: "Cancelled" as OrderStatus,
        isArchived: true,
        deletedAt: new Date().toISOString(),
        internalNotes: reason ? `${item.internalNotes ? item.internalNotes + "\n" : ""}[Archived: ${reason}]` : item.internalNotes,
      };
    }
    return item;
  });
  await writeJson(ordersFile, updated);
  return true;
}
