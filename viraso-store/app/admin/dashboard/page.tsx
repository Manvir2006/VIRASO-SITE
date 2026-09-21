import Link from "next/link";
import { listOrders, listComplaints, listEnquiries } from "@/lib/support-store";
import { listRegistrations, registrationStats } from "@/lib/product-registration-store";
import { getManagedProducts } from "@/lib/product-store";
import { getInventoryItems } from "@/lib/inventory-store";
import { warrantyStats } from "@/lib/warranty-store";
import { getB2BStats } from "@/lib/b2b-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [orders, complaints, enquiries, registrations, regStats, products, inventory, wStats, b2bStats] =
    await Promise.all([
      listOrders(false),
      listComplaints(false),
      listEnquiries(false),
      listRegistrations(false),
      registrationStats(),
      getManagedProducts(),
      getInventoryItems(),
      warrantyStats(),
      getB2BStats(),
    ]);

  const totalSalesAmount = orders.reduce((sum, o) => {
    return sum + (o.totalAmount || (o.quantity * 3499));
  }, 0);

  const pendingOrders = orders.filter((o) =>
    ["Pending", "Confirmed", "Processing", "Packed"].includes(o.status)
  );

  const lowStockCount = inventory.filter((i) => i.stockStatus === "Low Stock").length;
  const outOfStockCount = inventory.filter((i) => i.stockStatus === "Out of Stock").length;

  const openComplaints = complaints.filter((c) => c.status !== "Resolved");
  const pendingEnquiries = enquiries.filter((e) => e.status !== "Resolved" && e.status !== "Closed");

  const statCards = [
    {
      title: "Total Sales",
      value: `₹${totalSalesAmount.toLocaleString("en-IN")}`,
      subtitle: `${orders.length} orders recorded`,
      href: "/admin/orders",
      color: "text-emerald-700",
      bg: "bg-emerald-50/50",
    },
    {
      title: "Pending Fulfillment",
      value: pendingOrders.length,
      subtitle: "Orders awaiting dispatch",
      href: "/admin/orders?status=Pending",
      color: "text-amber-700",
      bg: "bg-amber-50/50",
    },
    {
      title: "Stock Alert Items",
      value: lowStockCount + outOfStockCount,
      subtitle: `${outOfStockCount} out of stock, ${lowStockCount} low`,
      href: "/admin/inventory",
      color: "text-red-700",
      bg: "bg-red-50/50",
    },
    {
      title: "Product Registrations",
      value: registrations.length,
      subtitle: `${regStats.verified} verified warranties`,
      href: "/admin/product-registrations",
      color: "text-[#0d2946]",
      bg: "bg-blue-50/50",
    },
    {
      title: "Active Warranties",
      value: wStats.active,
      subtitle: `${wStats.expired} expired coverage`,
      href: "/admin/warranty",
      color: "text-emerald-700",
      bg: "bg-emerald-50/50",
    },
    {
      title: "Open Complaints",
      value: openComplaints.length,
      subtitle: "Defect claims in queue",
      href: "/admin/complaints",
      color: "text-amber-700",
      bg: "bg-amber-50/50",
    },
    {
      title: "Contact Inquiries",
      value: pendingEnquiries.length,
      subtitle: "Customer messages",
      href: "/admin/contact-enquiries",
      color: "text-blue-700",
      bg: "bg-blue-50/50",
    },
    {
      title: "B2B Wholesale Inquiries",
      value: b2bStats.total,
      subtitle: `${b2bStats.newCount} new, ${b2bStats.converted} converted`,
      href: "/admin/b2b-inquiries",
      color: "text-purple-700",
      bg: "bg-purple-50/50",
    },
    {
      title: "Active Catalog",
      value: products.filter((p) => p.publishStatus === "Published").length,
      subtitle: `${products.length} total managed products`,
      href: "/admin/products",
      color: "text-slate-800",
      bg: "bg-slate-50",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">
            Operational Overview
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Viraso Operations Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Real-time metrics connected to the persistent Viraso database stores.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/products/add"
            className="rounded-full bg-[#0d2946] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#071d31] shadow-sm"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/track-orders"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Track Orders
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0d2946] hover:shadow-md ${card.bg}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {card.title}
            </p>
            <p className={`mt-3 text-3xl font-black ${card.color}`}>
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {card.subtitle}
            </p>
          </Link>
        ))}
      </div>

      {/* Operational Modules Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders Overview */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Latest orders submitted across sales channels</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#0d2946] hover:underline"
            >
              View All Orders ({orders.length}) →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order.orderNumber} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <Link
                    href={`/admin/orders/${order.orderNumber}`}
                    className="font-mono font-bold text-[#0d2946] hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                  <p className="font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-slate-500">{order.product} (Qty: {order.quantity})</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700">
                    {order.status}
                  </span>
                  <p className="mt-1 font-bold text-slate-900">
                    ₹{(order.totalAmount || order.quantity * 3499).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">No orders recorded yet.</p>
            )}
          </div>
        </div>

        {/* Customer Support & Quality Queue */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Support & Quality Queue</h2>
              <p className="text-xs text-slate-500">Pending customer resolutions and inquiries</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/complaints"
                className="text-xs font-bold text-[#0d2946] hover:underline"
              >
                Complaints
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/admin/contact-enquiries"
                className="text-xs font-bold text-[#0d2946] hover:underline"
              >
                Enquiries
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Open Product Complaints</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {openComplaints.length} Action Needed
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Customer defect reports, part replacement claims, and warranty tickets.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Incoming Contact Enquiries</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {pendingEnquiries.length} Unresolved
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Dealer inquiries, wholesale requests, and general buyer inquiries.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Warranty Registrations</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {regStats.total} Devices
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {regStats.today} registered today. {wStats.active} warranties currently active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
