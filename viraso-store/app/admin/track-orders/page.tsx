"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function AdminTrackOrdersPage() {
  const [lookupQuery, setLookupQuery] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [courierPartners, setCourierPartners] = useState<CourierPartner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit fields
  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  useEffect(() => {
    fetch("/api/couriers")
      .then((res) => res.json())
      .then((data) => setCourierPartners(data.couriers || []))
      .catch(() => {});
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");
    setOrder(null);

    try {
      // Fetch via admin orders API with search
      const res = await fetch(
        `/api/admin/orders?search=${encodeURIComponent(lookupQuery.trim())}`,
        {
          headers: { "x-admin-key": key() },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed.");

      const matched: OrderRecord[] = data.orders || [];
      if (matched.length === 0) {
        setError(`No order found matching "${lookupQuery}". Please check the order number or customer phone.`);
        return;
      }

      // Pick exact or first
      const item =
        matched.find(
          (o) => o.orderNumber.toUpperCase() === lookupQuery.trim().toUpperCase()
        ) || matched[0];

      setOrder(item);
      setStatus(item.status);
      setCourier(item.courier || "");
      setTrackingNumber(item.trackingNumber || "");
    } catch (err: any) {
      setError(err.message || "Failed to search for order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          status,
          courier,
          trackingNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update tracking.");

      setOrder(data.order);
      setSuccess("Tracking information updated. Customer portal reflects these changes immediately.");
      setTimeout(() => setSuccess(""), 4500);
    } catch (err: any) {
      setError(err.message || "Failed to save updates.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">
          Customer Support
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
          Order Tracking Hub
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Admin dispatch and courier tracking console. Any updates made here sync in real-time with
          the customer-facing order tracking portal at <code className="text-[#0d2946] font-bold">/support/track-order</code>.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-black text-slate-900">Find Order to Track or Update</h2>
        <form onSubmit={handleLookup} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder="Enter Order Number (e.g. VIR12345), Customer Phone, or Tracking ID..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2946] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60"
          >
            {isLoading ? "Searching..." : "Lookup Order"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700">
            ✕ {error}
          </div>
        )}
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {success}
        </div>
      )}

      {order && (
        <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in">
          {/* Tracking Form (Left 2 Cols) */}
          <div className="space-y-6 lg:col-span-2">
            <form onSubmit={handleUpdate} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Update Courier & Status</h2>
                  <p className="text-xs text-slate-500">Order #{order.orderNumber}</p>
                </div>
                <Link
                  href={`/admin/orders/${order.orderNumber}`}
                  className="text-xs font-bold text-[#0d2946] hover:underline"
                >
                  View Full Order →
                </Link>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Fulfillment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Courier Partner
                    </label>
                    <Link
                      href="/admin/settings/couriers"
                      className="text-[11px] font-bold text-[#0d2946] hover:underline"
                    >
                      Settings ⚙
                    </Link>
                  </div>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
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
                    placeholder="e.g. DL982710298"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Live tracking preview */}
                {(() => {
                  const partner = courierPartners.find(
                    (c) => c.name.toLowerCase() === courier.toLowerCase() || c.id.toLowerCase() === courier.toLowerCase()
                  );
                  const previewUrl = partner
                    ? resolveTrackingUrl(partner, {
                        orderNumber: order.orderNumber,
                        trackingNumber: trackingNumber,
                      })
                    : "";

                  return (
                    <div className="sm:col-span-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Live Customer Courier Tracking Link
                        </span>
                        {previewUrl && (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-[#0d2946] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#071d31]"
                          >
                            Test Link ↗
                          </a>
                        )}
                      </div>
                      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 break-all select-all shadow-sm">
                        {previewUrl || (
                          <span className="text-slate-400 font-sans italic">
                            Select a courier partner above to preview the generated tracking URL.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-[#0d2946] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
                >
                  {isSaving ? "Saving..." : "Update Live Tracking"}
                </button>
              </div>
            </form>

            {/* Customer Tracking Timeline Preview */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-black text-slate-900">Live Customer Portal Status</h3>
              <p className="mt-1 text-xs text-slate-500">
                This timeline matches what the customer currently sees:
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {order.timeline.map((step) => {
                  const isDone =
                    order.timeline.indexOf(step) <= order.timeline.indexOf(order.status) ||
                    order.status === "Delivered";
                  return (
                    <div
                      key={step}
                      className={`flex flex-col justify-between rounded-xl border p-3 ${
                        isDone
                          ? "border-[#0d2946] bg-blue-50/60 text-[#0d2946]"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      <span className="text-base font-black">{isDone ? "✓" : "○"}</span>
                      <span className="mt-2 text-xs font-bold">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Order Overview</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</p>
                  <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
                  <p className="font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.mobile}</p>
                  <p className="text-xs text-slate-500">{order.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Product</p>
                  <p className="font-bold text-slate-900">{order.product}</p>
                  <p className="text-xs text-slate-500">Quantity: {order.quantity}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Address</p>
                  <p className="text-xs text-slate-700">{order.shippingAddress || "Not specified"}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  href="/support/track-order"
                  target="_blank"
                  className="block text-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                >
                  Open Customer Track Page ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
