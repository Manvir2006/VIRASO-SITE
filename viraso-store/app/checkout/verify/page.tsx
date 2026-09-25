"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";

function VerifyContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID was found in the payment return URL.");
      setLoading(false);
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await fetch(`/api/orders/verify?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (res.ok && data.success && data.paymentStatus === "Paid") {
          // Clear cart and checkout storage upon confirmed payment
          localStorage.removeItem("viraso-cart");
          localStorage.removeItem("viraso-checkout");
          setOrder(data.order || { cashfreeOrderId: orderId, paymentStatus: "Paid" });
        } else {
          setError(
            data.message ||
              "Your payment could not be confirmed as paid. If money was debited, it will be automatically verified or refunded within 2-4 business days."
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to contact payment verification server.");
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-[#0d2946]" />
        <h2 className="mt-6 text-2xl font-black text-slate-900">Verifying Payment...</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connecting to Cashfree secure server to confirm your transaction status. Please do not refresh.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-red-600">Payment Issue</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">Payment Verification Failed</h2>
        <p className="mt-3 text-sm text-slate-600">{error}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]"
          >
            Return to Checkout
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Contact Viraso Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
        Payment Verified & Confirmed
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
        Thank You For Your Order!
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Your payment was processed securely via Cashfree. We have dispatched order details to our fulfillment warehouse.
      </p>

      <div className="mt-8 space-y-3 rounded-2xl bg-slate-50 p-6 text-left text-sm">
        {order.orderNumber && (
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-600">Order Number:</span>
            <span className="font-mono font-bold text-[#0d2946]">{order.orderNumber}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="font-semibold text-slate-600">Cashfree Order ID:</span>
          <span className="font-mono text-xs text-slate-700">{order.cashfreeOrderId || orderId}</span>
        </div>
        {order.cashfreePaymentId && (
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-600">Cashfree Payment ID:</span>
            <span className="font-mono text-xs text-emerald-700 font-bold">{order.cashfreePaymentId}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="font-semibold text-slate-600">Payment Status:</span>
          <span className="font-bold text-emerald-700">Paid (Verified)</span>
        </div>
        {order.customerName && (
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-600">Customer Name:</span>
            <span className="text-slate-800 font-medium">{order.customerName}</span>
          </div>
        )}
        {order.totalAmount && (
          <div className="flex justify-between pt-1">
            <span className="font-semibold text-slate-600">Total Paid:</span>
            <span className="font-black text-slate-900">₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/track-order?orderNumber=${order.orderNumber || ""}`}
          className="rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]"
        >
          Track Your Order
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutVerifyPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <main className="px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="mx-auto max-w-lg text-center p-10">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#0d2946]" />
              <p className="mt-4 text-sm text-slate-600">Loading payment status...</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}
