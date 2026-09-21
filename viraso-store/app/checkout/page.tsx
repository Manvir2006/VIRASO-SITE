"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type CheckoutItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    const fromCart = JSON.parse(localStorage.getItem("viraso-cart") || "[]");
    const fromProduct = JSON.parse(localStorage.getItem("viraso-checkout") || "[]");
    const selected = fromProduct.length ? fromProduct : fromCart;
    setItems(selected);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handlePay = async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill in your full name, phone number, and shipping address.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          items,
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      // Clear cart
      localStorage.removeItem("viraso-cart");
      localStorage.removeItem("viraso-checkout");

      setCompletedOrder(data.order);
    } catch (err: any) {
      alert(err.message || "Failed to process payment with Cashfree. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedOrder) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
            Payment Successful
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Thank you, {completedOrder.customerName}. Your order has been placed and received by our warehouse.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Order Number:</span>
              <span className="font-mono font-bold text-[#0d2946]">{completedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Cashfree Order ID:</span>
              <span className="font-mono text-xs text-slate-700">{completedOrder.cashfreeOrderId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Payment Status:</span>
              <span className="font-bold text-emerald-700">{completedOrder.paymentStatus}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-slate-600">Total Paid:</span>
              <span className="font-black text-slate-900">₹{(completedOrder.totalAmount || total).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/support/track-order`}
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Checkout</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Secure Checkout</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Customer Details</h2>
            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Full Name *</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none" placeholder="Your name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Phone Number *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none" placeholder="Phone number" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none" placeholder="Email address" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Shipping Address *</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none" placeholder="House #, street, locality, city, state, and pin code" />
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Order Summary</h2>

            <div className="mt-6 space-y-4">
              {items.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Your cart is empty. <Link href="/products" className="font-bold text-[#0d2946] underline">Browse products</Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">No Img</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#111111] line-clamp-1">{item.name}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-[#111111]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-3 text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#111111]">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-black text-[#111111]">
                <span>Final Payable</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing || items.length === 0}
              onClick={handlePay}
              className="mt-8 w-full rounded-full bg-[#0d2946] py-3.5 text-center font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60 shadow-md"
            >
              {isProcessing ? "Connecting Cashfree Gateway..." : "PAY VIA CASHFREE"}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Encrypted 256-Bit SSL Cashfree Payment Gateway
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
