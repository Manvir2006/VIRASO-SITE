import { NextRequest, NextResponse } from "next/server";
import {
  listOrders,
  listComplaints,
  listEnquiries,
  OrderRecord,
  ComplaintRecord,
  ContactEnquiry,
} from "@/lib/support-store";
import { listB2BInquiries, B2BInquiryRecord } from "@/lib/b2b-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    let orders: OrderRecord[] = [];
    let complaints: ComplaintRecord[] = [];
    let inquiries: ContactEnquiry[] = [];
    let b2bInquiries: B2BInquiryRecord[] = [];

    try {
      orders = await listOrders(false);
    } catch {}
    try {
      complaints = await listComplaints(false);
    } catch {}
    try {
      inquiries = await listEnquiries(false);
    } catch {}
    try {
      b2bInquiries = await listB2BInquiries(false);
    } catch {}

    const pendingOrders = orders.filter((o: OrderRecord) =>
      ["Pending", "Confirmed", "Processing", "Packed"].includes(o.status)
    );
    const newComplaints = complaints.filter((c: ComplaintRecord) =>
      ["New", "Under Review"].includes(c.status)
    );
    const newB2b = b2bInquiries.filter((b: B2BInquiryRecord) => b.status === "New");
    const newEnquiries = inquiries.filter((e: ContactEnquiry) =>
      ["New", "Contacted", "In Progress"].includes(e.status)
    );

    // Build unified recent feed
    type FeedItem = {
      id: string;
      type: "order" | "complaint" | "b2b" | "enquiry";
      title: string;
      subtitle: string;
      timestamp: string;
      href: string;
      status: string;
      amount?: number;
      badgeColor: string;
    };

    const feed: FeedItem[] = [];

    // Recent orders (last 10)
    orders.slice(0, 10).forEach((o: OrderRecord) => {
      feed.push({
        id: o.orderNumber || o.id,
        type: "order",
        title: `Order #${o.orderNumber || o.id}`,
        subtitle: `${o.customerName} • ₹${o.totalAmount || 0} (${o.product || "Product"})`,
        timestamp: o.createdAt || o.orderDate || new Date().toISOString(),
        href: `/admin/orders`,
        status: o.status || "Pending",
        amount: o.totalAmount,
        badgeColor:
          o.status === "Pending"
            ? "bg-amber-100 text-amber-800"
            : "bg-blue-100 text-blue-800",
      });
    });

    // Recent complaints (last 10)
    complaints.slice(0, 10).forEach((c: ComplaintRecord) => {
      feed.push({
        id: c.id,
        type: "complaint",
        title: `Complaint #${c.id}`,
        subtitle: `${c.customerName} • ${c.complaintType}: ${c.productName}`,
        timestamp: c.submittedAt || new Date().toISOString(),
        href: `/admin/complaints`,
        status: c.status || "New",
        badgeColor:
          c.status === "New"
            ? "bg-rose-100 text-rose-800"
            : "bg-purple-100 text-purple-800",
      });
    });

    // Recent B2B inquiries (last 10)
    b2bInquiries.slice(0, 10).forEach((b: B2BInquiryRecord) => {
      feed.push({
        id: b.inquiry_number || b.id,
        type: "b2b",
        title: `B2B Inquiry #${b.inquiry_number || b.id}`,
        subtitle: `${b.company_name} • ${b.contact_person_name} (${b.monthly_quantity || "Bulk"})`,
        timestamp: b.created_at || new Date().toISOString(),
        href: `/admin/b2b-inquiries`,
        status: b.status || "New",
        badgeColor:
          b.status === "New"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-100 text-slate-800",
      });
    });

    // Sort combined feed descending by timestamp
    feed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      summary: {
        pendingOrdersCount: pendingOrders.length,
        newComplaintsCount: newComplaints.length,
        newB2bCount: newB2b.length,
        newEnquiriesCount: newEnquiries.length,
        totalUnread:
          pendingOrders.length + newComplaints.length + newB2b.length,
      },
      feed: feed.slice(0, 25),
    });
  } catch (error) {
    console.error("Notifications feed error:", error);
    return NextResponse.json(
      { error: "Failed to generate notification feed." },
      { status: 500 }
    );
  }
}
