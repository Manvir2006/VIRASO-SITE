"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

type TrackedOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  mobile: string;
  email?: string;
  product: string;
  quantity: number;
  orderDate: string;
  status: string;
  shippingStatus?: string;
  courier?: string | null;
  trackingNumber?: string | null;
  courierReference?: string | null;
  shippingDate?: string | null;
  courierTrackingUrl?: string | null;
  timeline?: string[];
};

export function TrackOrderView() {
  const [orderId, setOrderId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanOrderId = orderId.trim();
    const cleanMobile = mobileNumber.trim();

    if (!cleanOrderId || !cleanMobile) {
      setError("Please provide both your Viraso Order ID and mobile number.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/support/track-order?orderId=${encodeURIComponent(cleanOrderId)}&mobile=${encodeURIComponent(cleanMobile)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setOrder(null);
        setError(data.error || "Order ID or mobile number is incorrect.");
        return;
      }

      setOrder(data.order);
      setError("");
    } catch (err) {
      console.error("Tracking request failed:", err);
      setError("Unable to retrieve tracking details at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Subheader Quick Links */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d2946]">Order Status</p>
              <h1 className="text-2xl font-black text-slate-900">Track Your Order</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                Browse Products
              </Link>
              <Link
                href="/support/contact"
                className="inline-flex rounded-full bg-[#0d2946] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#071d31]"
              >
                Contact Support
              </Link>
            </div>
          </div>

        {/* Main Content Card */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0d2946]" />
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">
              Viraso Logistics & Delivery
            </p>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your Viraso Order ID and customer mobile number to track real-time delivery status.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form when order not yet found */}
          {!order ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="orderIdInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Viraso Order ID
                  </label>
                  <input
                    id="orderIdInput"
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your Viraso Order ID"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    e.g. VIR-2026-00125 or VIR12345
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="mobileInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Mobile Number
                  </label>
                  <input
                    id="mobileInput"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder-slate-400 transition focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    e.g. 9876543210
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0d2946] py-4 text-sm font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#071d31] hover:shadow-lg disabled:opacity-60 sm:w-auto sm:px-10"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Tracking Order...</span>
                    </>
                  ) : (
                    <span>TRACK ORDER</span>
                  )}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Need Assistance?</p>
                <p className="mt-0.5">
                  If you cannot locate your Viraso Order ID, please check your purchase receipt or contact our customer team at{" "}
                  <a href="mailto:viraso.india@gmail.com" className="font-semibold text-[#0d2946] underline">
                    viraso.india@gmail.com
                  </a>.
                </p>
              </div>
            </form>
          ) : (
            /* Order Found Display */
            <div className="mt-8 space-y-8 animate-in fade-in duration-300">
              {/* Order Found Card */}
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <span>✓</span>
                      <span>Order Found</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                      Order ID: {order.orderNumber}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Order Date: {order.orderDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Status
                    </span>
                    <span
                      className={`inline-block rounded-full px-4 py-1.5 text-xs font-black tracking-wide ${
                        order.status === "Delivered"
                          ? "bg-emerald-600 text-white"
                          : order.status === "Cancelled"
                          ? "bg-red-600 text-white"
                          : "bg-[#0d2946] text-white"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Info summary table */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 border-t border-emerald-100 pt-6">
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-emerald-100/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Delivery Partner
                    </span>
                    <p className="mt-1 font-black text-slate-900 text-base">
                      {order.courier || "Processing Dispatch"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-emerald-100/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Tracking ID
                    </span>
                    <p className="mt-1 font-mono font-bold text-slate-900 text-base">
                      {order.trackingNumber || "Available upon dispatch"}
                    </p>
                  </div>

                  {order.shippingDate && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-emerald-100/80 sm:col-span-2 lg:col-span-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Shipping Date
                      </span>
                      <p className="mt-1 font-bold text-slate-900 text-base">
                        {order.shippingDate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Prominent Track Shipment Action */}
                <div className="mt-6 pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {order.courierTrackingUrl ? (
                    <a
                      href={order.courierTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0d2946] px-8 py-4 text-base font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-[#071d31] hover:shadow-xl group"
                    >
                      <span>TRACK SHIPMENT</span>
                      <span className="text-lg transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                    </a>
                  ) : (
                    <div className="rounded-2xl bg-white/80 p-4 text-xs font-semibold text-slate-600 border border-emerald-100">
                      📦 Logistics tracking link will become active once your package is dispatched by our logistics team.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                  >
                    Track Another Order
                  </button>
                </div>
              </div>

              {/* Timeline Progress */}
              {order.timeline && order.timeline.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="text-lg font-black text-slate-900">Shipment Milestones</h3>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {order.timeline.map((step, idx) => {
                      const isCompleted =
                        order.timeline!.indexOf(step) <= order.timeline!.indexOf(order.status) ||
                        order.status === "Delivered";
                      return (
                        <div
                          key={`${step}-${idx}`}
                          className={`rounded-2xl border p-4 transition ${
                            isCompleted
                              ? "border-[#0d2946] bg-[#edf2f7] text-[#0d2946]"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isCompleted ? "bg-[#0d2946] text-white" : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {isCompleted ? "✓" : idx + 1}
                            </span>
                            <span className="text-xs font-bold">{step}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Item Summary */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-lg font-black text-slate-900">Order Information</h3>
                <div className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500 font-medium">Product</span>
                    <span className="font-bold text-slate-900">{order.product}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500 font-medium">Quantity</span>
                    <span className="font-bold text-slate-900">{order.quantity} Unit(s)</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500 font-medium">Customer Name</span>
                    <span className="font-bold text-slate-900">{order.customerName}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500 font-medium">Registered Mobile</span>
                    <span className="font-mono font-bold text-slate-900">
                      ••••••{order.mobile ? order.mobile.slice(-4) : "••••"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
  );
}
