"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminTableShell } from "@/components/admin-table-shell";
import type { CustomerProfile } from "@/lib/customer-store";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState<
    "orders" | "registrations" | "complaints" | "enquiries"
  >("orders");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/customers", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.mobile.includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.city.toLowerCase().includes(s) ||
        c.state.toLowerCase().includes(s)
    );
  }, [customers, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminTableShell
        title="Customers CRM Directory"
        description="Unified customer accounts aggregated from stored orders, product warranty registrations, support tickets, and contact inquiries."
        totalCount={customers.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer name, mobile, email, city, or state..."
        isLoading={isLoading}
        isEmpty={filteredCustomers.length === 0}
        emptyMessage="No customer records match your query."
        onResetFilters={() => setSearch("")}
        actions={
          <button
            onClick={loadCustomers}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            ↻ Refresh Directory
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Customer Name</th>
                <th className="px-5 py-3.5 font-bold">Mobile & Email</th>
                <th className="px-5 py-3.5 font-bold">Orders</th>
                <th className="px-5 py-3.5 font-bold">Registered Devices</th>
                <th className="px-5 py-3.5 font-bold">Complaints</th>
                <th className="px-5 py-3.5 font-bold">Total Spent</th>
                <th className="px-5 py-3.5 font-bold">Last Activity</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{customer.name}</p>
                    {(customer.city || customer.state) && (
                      <p className="text-xs text-slate-400">
                        {[customer.city, customer.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-mono text-slate-900 font-semibold">{customer.mobile || "-"}</p>
                    {customer.email && <p className="text-xs text-slate-500">{customer.email}</p>}
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                    {customer.ordersCount}
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                    {customer.registrationsCount}
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        customer.complaintsCount > 0
                          ? "bg-amber-100 text-amber-800 font-bold"
                          : "text-slate-400 font-normal"
                      }`}
                    >
                      {customer.complaintsCount}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    ₹{customer.totalSpend.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(customer.lastActivity).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setActiveCustomerTab("orders");
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                    >
                      360° Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableShell>

      {/* Customer 360 Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0d2946]">Customer 360° Profile</p>
                <h3 className="text-2xl font-black text-slate-900">{selectedCustomer.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spend</p>
                <p className="mt-1 text-lg font-black text-slate-900">₹{selectedCustomer.totalSpend.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
                <p className="mt-1 text-lg font-black text-[#0d2946]">{selectedCustomer.ordersCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registrations</p>
                <p className="mt-1 text-lg font-black text-emerald-600">{selectedCustomer.registrationsCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complaints</p>
                <p className="mt-1 text-lg font-black text-amber-600">{selectedCustomer.complaintsCount}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <div className="flex flex-wrap gap-6">
                <div>
                  <span className="font-bold text-slate-900">Mobile: </span>
                  <a href={`tel:${selectedCustomer.mobile}`} className="text-[#0d2946] font-mono hover:underline">
                    {selectedCustomer.mobile || "Not specified"}
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Email: </span>
                  <a href={`mailto:${selectedCustomer.email}`} className="text-[#0d2946] hover:underline">
                    {selectedCustomer.email || "Not specified"}
                  </a>
                </div>
                {selectedCustomer.address && (
                  <div>
                    <span className="font-bold text-slate-900">Address: </span>
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Tabs */}
            <div className="mt-6 flex border-b border-slate-200 gap-2">
              {[
                { key: "orders", label: `Orders (${selectedCustomer.orders.length})` },
                { key: "registrations", label: `Registrations (${selectedCustomer.registrations.length})` },
                { key: "complaints", label: `Complaints (${selectedCustomer.complaints.length})` },
                { key: "enquiries", label: `Enquiries (${selectedCustomer.enquiries.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCustomerTab(tab.key as any)}
                  className={`border-b-2 px-3.5 py-2 text-xs font-bold transition ${
                    activeCustomerTab === tab.key
                      ? "border-[#0d2946] text-[#0d2946]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="mt-4">
              {activeCustomerTab === "orders" && (
                <div className="space-y-3">
                  {selectedCustomer.orders.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No orders placed yet.</p>
                  ) : (
                    selectedCustomer.orders.map((o) => (
                      <div key={o.orderNumber} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                        <div>
                          <Link href={`/admin/orders/${o.orderNumber}`} className="font-mono font-bold text-[#0d2946] hover:underline">
                            #{o.orderNumber}
                          </Link>
                          <p className="font-bold text-slate-900">{o.product}</p>
                          <p className="text-slate-500">{o.orderDate} | Qty: {o.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 font-bold text-slate-800">
                            {o.status}
                          </span>
                          <p className="mt-1 font-bold text-slate-900">
                            ₹{(o.totalAmount || o.quantity * 3499).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeCustomerTab === "registrations" && (
                <div className="space-y-3">
                  {selectedCustomer.registrations.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No product registrations found.</p>
                  ) : (
                    selectedCustomer.registrations.map((r) => (
                      <div key={r.registrationId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                        <div>
                          <p className="font-mono font-bold text-[#0d2946]">{r.registrationId}</p>
                          <p className="font-bold text-slate-900">{r.productName}</p>
                          <p className="font-mono text-slate-500">Serial: {r.serialNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                            {r.status}
                          </span>
                          <p className="mt-1 text-slate-500">Purchased: {r.purchaseDate}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeCustomerTab === "complaints" && (
                <div className="space-y-3">
                  {selectedCustomer.complaints.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No customer support complaints filed.</p>
                  ) : (
                    selectedCustomer.complaints.map((c) => (
                      <div key={c.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#0d2946]">{c.id}</span>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                            {c.status}
                          </span>
                        </div>
                        <p className="mt-1 font-bold text-slate-900">{c.complaintType} - {c.productName}</p>
                        <p className="mt-1 text-slate-600 line-clamp-2">{c.complaintDescription}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeCustomerTab === "enquiries" && (
                <div className="space-y-3">
                  {selectedCustomer.enquiries.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No contact messages received.</p>
                  ) : (
                    selectedCustomer.enquiries.map((e) => (
                      <div key={e.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#0d2946]">{e.id}</span>
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 font-bold text-slate-700">
                            {e.status}
                          </span>
                        </div>
                        <p className="mt-1 font-bold text-slate-900">{e.subject}</p>
                        <p className="mt-1 text-slate-600 line-clamp-2">{e.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
