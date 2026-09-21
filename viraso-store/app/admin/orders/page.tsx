"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminTableShell } from "@/components/admin-table-shell";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type { OrderRecord, OrderStatus } from "@/lib/support-store";

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Delete / Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<OrderRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.mobile.includes(search) ||
        order.email.toLowerCase().includes(search.toLowerCase()) ||
        (order.courier && order.courier.toLowerCase().includes(search.toLowerCase())) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
        (order.cashfreeOrderId && order.cashfreeOrderId.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Pending Group"
          ? ["Pending", "Processing", "Confirmed", "Packed"].includes(order.status)
          : order.status === selectedStatus);

      return matchSearch && matchStatus;
    });
  }, [orders, search, selectedStatus]);

  const handleQuickStatusUpdate = async (orderNumber: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({ orderNumber, status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: nextStatus } : o))
        );
        setToast(`Order ${orderNumber} updated to ${nextStatus}.`);
        setTimeout(() => setToast(""), 3500);
      }
    } catch (err) {
      console.error("Quick status update failed:", err);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/orders?orderNumber=${encodeURIComponent(cancelTarget.orderNumber)}&reason=Cancelled via Admin Orders Table`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );
      if (res.ok) {
        setToast(`Order ${cancelTarget.orderNumber} cancelled and archived.`);
        setTimeout(() => setToast(""), 4000);
        await loadOrders();
      }
    } catch (err) {
      console.error("Cancel order failed:", err);
    } finally {
      setIsDeleting(false);
      setCancelTarget(null);
    }
  };

  const filterPills = [
    { label: "All Orders", active: selectedStatus === "All", onClick: () => setSelectedStatus("All"), count: orders.length },
    { label: "Pending Fulfillment", active: selectedStatus === "Pending Group", onClick: () => setSelectedStatus("Pending Group"), count: orders.filter((o) => ["Pending", "Processing", "Confirmed", "Packed"].includes(o.status)).length },
    { label: "Shipped", active: selectedStatus === "Shipped", onClick: () => setSelectedStatus("Shipped"), count: orders.filter((o) => o.status === "Shipped").length },
    { label: "Delivered", active: selectedStatus === "Delivered", onClick: () => setSelectedStatus("Delivered"), count: orders.filter((o) => o.status === "Delivered").length },
    { label: "Cancelled", active: selectedStatus === "Cancelled", onClick: () => setSelectedStatus("Cancelled"), count: orders.filter((o) => o.status === "Cancelled").length },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {toast && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-800 shadow-sm animate-in fade-in">
          <span>✓ {toast}</span>
          <button onClick={() => setToast("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      <AdminTableShell
        title="Sales & Orders"
        description="Comprehensive order lifecycle management with Cashfree payment sync and live courier tracking."
        totalCount={orders.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order #, customer, phone, courier, tracking, or Cashfree ID..."
        filterPills={filterPills}
        isLoading={isLoading}
        isEmpty={filteredOrders.length === 0}
        emptyMessage="No customer orders match your search."
        onResetFilters={() => {
          setSearch("");
          setSelectedStatus("All");
        }}
        actions={
          <button
            onClick={loadOrders}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ↻ Refresh Orders
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Order #</th>
                <th className="px-5 py-3.5 font-bold">Date</th>
                <th className="px-5 py-3.5 font-bold">Customer</th>
                <th className="px-5 py-3.5 font-bold">Items & Total</th>
                <th className="px-5 py-3.5 font-bold">Payment & Courier</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const total = order.totalAmount || (order.quantity * 3499);
                return (
                  <tr key={order.orderNumber} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="font-mono font-bold text-[#0d2946] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      {order.cashfreeOrderId && (
                        <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                          CF: {order.cashfreeOrderId}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {order.orderDate}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.mobile}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                        {order.product}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {order.quantity} | Total: ₹{total.toLocaleString("en-IN")}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          {order.paymentStatus || "Paid"}
                        </span>
                        {order.courier ? (
                          <span className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">{order.courier}</span>
                            {order.trackingNumber ? `: ${order.trackingNumber}` : ""}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Courier not assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleQuickStatusUpdate(order.orderNumber, e.target.value as OrderStatus)
                        }
                        className={`rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-bold ${
                          order.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-800"
                            : order.status === "Cancelled"
                            ? "bg-red-50 text-red-800"
                            : ["Shipped", "Out for Delivery"].includes(order.status)
                            ? "bg-blue-50 text-blue-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] transition hover:bg-slate-100"
                        >
                          View
                        </Link>
                        {order.status !== "Cancelled" && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(order)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminTableShell>

      {/* Delete / Cancel Modal */}
      <AdminDeleteModal
        isOpen={Boolean(cancelTarget)}
        title="Cancel & Archive Order"
        itemType="Order"
        itemName={`Order #${cancelTarget?.orderNumber} - ${cancelTarget?.customerName}`}
        itemId={cancelTarget?.orderNumber}
        consequences="This order will be set to Cancelled and archived from the active sales view. Customer tracking status will reflect Cancelled."
        confirmLabel="Cancel Order"
        isLoading={isDeleting}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
