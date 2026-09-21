import { listOrders, listComplaints, listEnquiries, type OrderRecord, type ComplaintRecord, type ContactEnquiry } from "@/lib/support-store";
import { listRegistrations, type ProductRegistration } from "@/lib/product-registration-store";
import { listB2BInquiries, type B2BInquiryRecord } from "@/lib/b2b-store";

export type CustomerProfile = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  address: string;
  orders: OrderRecord[];
  registrations: ProductRegistration[];
  complaints: ComplaintRecord[];
  enquiries: ContactEnquiry[];
  b2bInquiries: B2BInquiryRecord[];
  totalSpend: number;
  ordersCount: number;
  registrationsCount: number;
  complaintsCount: number;
  enquiriesCount: number;
  b2bInquiriesCount: number;
  firstSeen: string;
  lastActivity: string;
};

const normalizeKey = (mobile?: string, email?: string) => {
  const cleanMobile = (mobile || "").replace(/[^0-9]/g, "").slice(-10);
  if (cleanMobile.length === 10) return `mob_${cleanMobile}`;
  const cleanEmail = (email || "").trim().toLowerCase();
  if (cleanEmail) return `eml_${cleanEmail}`;
  return "";
};

export async function getCustomers(search?: string): Promise<CustomerProfile[]> {
  const [orders, registrations, complaints, enquiries, b2bInquiries] = await Promise.all([
    listOrders(false),
    listRegistrations(false),
    listComplaints(false),
    listEnquiries(false),
    listB2BInquiries(false),
  ]);

  const map = new Map<string, CustomerProfile>();

  const getOrCreate = (mobile?: string, email?: string, name?: string): CustomerProfile | null => {
    const key = normalizeKey(mobile, email);
    if (!key) return null;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: name || "Customer",
        mobile: mobile || "",
        email: email || "",
        city: "",
        state: "",
        address: "",
        orders: [],
        registrations: [],
        complaints: [],
        enquiries: [],
        b2bInquiries: [],
        totalSpend: 0,
        ordersCount: 0,
        registrationsCount: 0,
        complaintsCount: 0,
        enquiriesCount: 0,
        b2bInquiriesCount: 0,
        firstSeen: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      });
    }

    const item = map.get(key)!;
    if (name && (!item.name || item.name === "Customer")) item.name = name;
    if (mobile && !item.mobile) item.mobile = mobile;
    if (email && !item.email) item.email = email;
    return item;
  };

  // Process orders
  for (const order of orders) {
    const profile = getOrCreate(order.mobile, order.email, order.customerName);
    if (profile) {
      profile.orders.push(order);
      profile.ordersCount++;
      const amount = order.totalAmount || (order.quantity * 3499);
      profile.totalSpend += amount;
      if (order.shippingAddress && !profile.address) profile.address = order.shippingAddress;
      const orderDate = order.createdAt || `${order.orderDate}T00:00:00.000Z`;
      if (orderDate < profile.firstSeen) profile.firstSeen = orderDate;
      if (orderDate > profile.lastActivity) profile.lastActivity = orderDate;
    }
  }

  // Process registrations
  for (const reg of registrations) {
    const profile = getOrCreate(reg.mobile, reg.email, reg.customerName);
    if (profile) {
      profile.registrations.push(reg);
      profile.registrationsCount++;
      if (reg.city && !profile.city) profile.city = reg.city;
      if (reg.state && !profile.state) profile.state = reg.state;
      if (reg.locality && !profile.address) profile.address = `${reg.locality}, ${reg.city}, ${reg.state} ${reg.pinCode}`;
      const regDate = reg.registrationDate;
      if (regDate < profile.firstSeen) profile.firstSeen = regDate;
      if (regDate > profile.lastActivity) profile.lastActivity = regDate;
    }
  }

  // Process complaints
  for (const complaint of complaints) {
    const profile = getOrCreate(complaint.mobileNumber, complaint.email, complaint.customerName);
    if (profile) {
      profile.complaints.push(complaint);
      profile.complaintsCount++;
      const compDate = complaint.submittedAt;
      if (compDate < profile.firstSeen) profile.firstSeen = compDate;
      if (compDate > profile.lastActivity) profile.lastActivity = compDate;
    }
  }

  // Process enquiries
  for (const enquiry of enquiries) {
    const profile = getOrCreate(enquiry.mobile, enquiry.email, enquiry.name);
    if (profile) {
      profile.enquiries.push(enquiry);
      profile.enquiriesCount++;
      const enqDate = enquiry.createdAt;
      if (enqDate < profile.firstSeen) profile.firstSeen = enqDate;
      if (enqDate > profile.lastActivity) profile.lastActivity = enqDate;
    }
  }

  // Process B2B Inquiries
  for (const b2b of b2bInquiries) {
    const profile = getOrCreate(b2b.mobile, b2b.email, b2b.contact_person_name);
    if (profile) {
      profile.b2bInquiries.push(b2b);
      profile.b2bInquiriesCount++;
      if (b2b.city && !profile.city) profile.city = b2b.city;
      if (b2b.state && !profile.state) profile.state = b2b.state;
      if (b2b.company_address && !profile.address) {
        profile.address = `${b2b.company_name} - ${b2b.company_address}, ${b2b.city}, ${b2b.state} ${b2b.pin_code}`;
      }
      const b2bDate = b2b.created_at;
      if (b2bDate < profile.firstSeen) profile.firstSeen = b2bDate;
      if (b2bDate > profile.lastActivity) profile.lastActivity = b2bDate;
    }
  }

  let list = Array.from(map.values()).sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.mobile.includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.city.toLowerCase().includes(s) ||
        c.state.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function getCustomerById(id: string): Promise<CustomerProfile | null> {
  const customers = await getCustomers();
  return customers.find((c) => c.id === id) ?? null;
}
