"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type { OrderRecord, OrderStatus } from "@/lib/support-store";
import { resolveTrackingUrl, type CourierPartner } from "@/lib/courier-utils";

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

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const orderNumber = decodeURIComponent(resolvedParams.id);

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [courierPartners, setCourierPartners] = useState<CourierPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // Editable Form State
  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierReference, setCourierReference] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [cashfreeOrderId, setCashfreeOrderId] = useState("");
  const [cashfreePaymentId, setCashfreePaymentId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadCouriers = async () => {
    try {
      const res = await fetch("/api/couriers");
      if (res.ok) {
        const data = await res.json();
        setCourierPartners(data.couriers || []);
      }
    } catch (err) {
      console.error("Failed to load couriers:", err);
    }
  };

  const loadOrder = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders?orderNumber=${encodeURIComponent(orderNumber)}`, {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found.");

      const item: OrderRecord = data.order;
      setOrder(item);
      setStatus(item.status);
      setCourier(item.courier || "");
      setTrackingNumber(item.trackingNumber || "");
      setCourierReference(item.courierReference || "");
      setShippingDate(item.shippingDate || "");
      setCashfreeOrderId(item.cashfreeOrderId || "");
      setCashfreePaymentId(item.cashfreePaymentId || "");
      setShippingAddress(item.shippingAddress || "");
      setInternalNotes(item.internalNotes || "");
    } catch (err: any) {
      setError(err.message || "Failed to load order.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCouriers();
    loadOrder();
  }, [orderNumber]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToast("");
    setError("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          orderNumber,
          status,
          courier,
          trackingNumber,
          courierReference,
          shippingDate,
          cashfreeOrderId,
          cashfreePaymentId,
          shippingAddress,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order.");

      setOrder(data.order);
      setToast("Order updated successfully. Customer tracking view is now updated.");
      setTimeout(() => setToast(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save order.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/orders?orderNumber=${encodeURIComponent(orderNumber)}&reason=Cancelled from order detail page`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );
      if (res.ok) {
        router.push("/admin/orders");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Loading order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-bold text-red-700">{error}</p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-flex rounded-full bg-[#0d2946] px-5 py-2.5 text-xs font-bold text-white"
        >
          ← Return to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const totalAmount = order.totalAmount || (order.quantity * 3499);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d2946] hover:underline"
          >
            ← Back to All Orders
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900">Order #{order.orderNumber}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                order.status === "Delivered"
                  ? "bg-emerald-100 text-emerald-800"
                  : order.status === "Cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-[#0d2946]"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Placed on {order.orderDate} {order.createdAt ? `(${new Date(order.createdAt).toLocaleTimeString()})` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            Cancel / Archive
          </button>
          <button
            type="submit"
            form="order-edit-form"
            disabled={isSaving}
            className="rounded-full bg-[#0d2946] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
          >
            {isSaving ? "Saving..." : "Save Updates"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          ✕ {error}
        </div>
      )}

      {/* Main Order Details Layout */}
      <form id="order-edit-form" onSubmit={handleSave} className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Order Data & Tracking Sync */}
        <div className="space-y-6 lg:col-span-2">
          {/* Purchased Items */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Purchased Items</h2>
            <div className="mt-6 divide-y divide-slate-100">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-black text-slate-900">{order.product}</p>
                  <p className="text-xs text-slate-500">Standard Viraso Unit Packaging</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-slate-900">Qty: {order.quantity}</p>
                  <p className="text-sm font-black text-[#0d2946]">₹{totalAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-3">Final Amount:</span>
              <span className="text-2xl font-black text-slate-900">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Shipping & Tracking Configuration */}
          {(() => {
            const selectedPartner = courierPartners.find(
              (c) => c.name.toLowerCase() === courier.toLowerCase() || c.id.toLowerCase() === courier.toLowerCase()
            );
            const liveTrackingUrl = selectedPartner
              ? resolveTrackingUrl(selectedPartner, {
                  orderNumber: order.orderNumber,
                  trackingNumber: trackingNumber,
                })
              : "";

            return (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Courier & Tracking Details</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Syncs directly with the customer tracking portal at /track-order and /support/track-order.
                    </p>
                  </div>
                  <Link
                    href="/admin/settings/couriers"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100 transition"
                  >
                    ⚙ Courier Settings
                  </Link>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Courier Partner
                    </label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    >
                      <option value="">Select Courier...</option>
                      {courierPartners.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.identifier_type === "viraso_order_id" ? "Viraso Order ID" : c.identifier_type === "page_only" ? "Page Only" : "Courier AWB"})
                        </option>
                      ))}
                      {courier && !courierPartners.some((c) => c.name.toLowerCase() === courier.toLowerCase()) && (
                        <option value={courier}>{courier} (Custom)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Tracking / AWB Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. EKT1283921 / DL192830192"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Courier Reference / Docket No
                    </label>
                    <input
                      type="text"
                      value={courierReference}
                      onChange={(e) => setCourierReference(e.target.value)}
                      placeholder="e.g. REF-2026-X81"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Shipping Date
                    </label>
                    <input
                      type="date"
                      value={shippingDate}
                      onChange={(e) => setShippingDate(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Live Generated Tracking Link Preview */}
                  <div className="sm:col-span-2 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Live Customer Tracking Link
                        </span>
                        {selectedPartner && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0d2946]">
                            {selectedPartner.identifier_type === "viraso_order_id"
                              ? "Uses Viraso Order ID"
                              : selectedPartner.identifier_type === "page_only"
                              ? "Tracking Page Only"
                              : "Uses Courier AWB"}
                          </span>
                        )}
                      </div>
                      {liveTrackingUrl && (
                        <a
                          href={liveTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-[#0d2946] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#071d31]"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </div>
                    <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 break-all select-all shadow-sm">
                      {liveTrackingUrl || (
                        <span className="text-slate-400 font-sans italic">
                          Select a courier partner above to automatically generate the customer tracking link.
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Controlled directly by Admin Courier Settings. The customer will access this via the &quot;TRACK SHIPMENT ↗&quot; button at /track-order.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Shipping Address
                    </label>
                    <textarea
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Full customer delivery address"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Cashfree Payment Sync */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Payment & Cashfree Gateway Sync</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Cashfree Order ID
                </label>
                <input
                  type="text"
                  value={cashfreeOrderId}
                  onChange={(e) => setCashfreeOrderId(e.target.value)}
                  placeholder="e.g. CF_ORD_819281"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Cashfree Payment Reference ID
                </label>
                <input
                  type="text"
                  value={cashfreePaymentId}
                  onChange={(e) => setCashfreePaymentId(e.target.value)}
                  placeholder="e.g. CF_PAY_928172"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Internal Audit & Notes</h2>
            <p className="mt-1 text-xs text-slate-500">
              Private notes seen only by the Marjara Enterprises admin team.
            </p>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Customer requested dispatch via evening Blue Dart pickup..."
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Right 1 Col: Customer & Status Panel */}
        <div className="space-y-6">
          {/* Order Lifecycle Status */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Order Lifecycle Status</h3>
            <p className="mt-1 text-xs text-slate-500">Update current fulfillment stage:</p>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Milestone Bar:</p>
              <div className="mt-3 space-y-2">
                {order.timeline.map((step, idx) => {
                  const isDone =
                    order.timeline.indexOf(step) <= order.timeline.indexOf(status) ||
                    status === "Delivered";
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs ${
                        isDone ? "bg-blue-50 font-bold text-[#0d2946]" : "text-slate-400"
                      }`}
                    >
                      <span>{isDone ? "✓" : "○"}</span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Profile Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Customer Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Name</p>
                <p className="font-bold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile</p>
                <p className="font-mono font-semibold text-slate-800">{order.mobile}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</p>
                <p className="font-semibold text-slate-800">{order.email || "Not specified"}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href={`/admin/customers?search=${encodeURIComponent(order.mobile)}`}
                className="block text-center rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-[#0d2946] hover:bg-slate-200"
              >
                View Customer Profile CRM →
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Delete / Cancel Modal */}
      <AdminDeleteModal
        isOpen={showDeleteModal}
        title="Cancel & Archive Order"
        itemType="Order"
        itemName={`Order #${order.orderNumber} (${order.customerName})`}
        itemId={order.orderNumber}
        consequences="This will update the order status to Cancelled and mark it as archived. It will be hidden from default sales listings."
        confirmLabel="Confirm Cancel Order"
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
