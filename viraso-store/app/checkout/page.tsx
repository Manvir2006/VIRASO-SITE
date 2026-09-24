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
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateName, setStateName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [demoBanner, setDemoBanner] = useState(false);

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
    if (!customerName.trim()) {
      alert("Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.trim()) {
      alert("Please provide your complete delivery address.");
      return;
    }

    const fullAddress = [
      address.trim(),
      city.trim(),
      stateName.trim(),
      pincode.trim() ? `PIN: ${pincode.trim()}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    setIsProcessing(true);
    setProcessingStatus("Creating secure payment session...");

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: cleanPhone.slice(-10),
          email: email.trim(),
          address: fullAddress,
          items,
          totalAmount: total,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status}. Please check your connection or server logs.`);
      }
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      if (data.isLiveGateway && data.paymentSessionId) {
        setProcessingStatus("Launching Cashfree Payment Gateway...");

        // Dynamically import and initialize Cashfree JS SDK
        const { load } = await import("@cashfreepayments/cashfree-js");
        const cashfree = await load({
          mode: (data.mode || "sandbox") as "sandbox" | "production",
        });

        if (!cashfree) {
          throw new Error("Could not initialize Cashfree JS SDK. Please try again.");
        }

        // Open Cashfree checkout modal
        cashfree
          .checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_modal",
          })
          .then(async (result: any) => {
            if (result.error) {
              console.log("Cashfree payment cancelled or error:", result.error);
              setIsProcessing(false);
              setProcessingStatus("");
              return;
            }

            if (result.paymentDetails || result.redirect) {
              setProcessingStatus("Verifying transaction...");
              const verifyRes = await fetch(
                `/api/orders/verify?order_id=${encodeURIComponent(data.cashfreeOrderId)}`
              );
              const verifyData = await verifyRes.json();

              localStorage.removeItem("viraso-cart");
              localStorage.removeItem("viraso-checkout");

              if (verifyRes.ok && verifyData.success) {
                setCompletedOrder(verifyData.order || data.order);
              } else {
                // If modal closed before webhook verification, route to verify page
                window.location.href = `/checkout/verify?order_id=${encodeURIComponent(
                  data.cashfreeOrderId
                )}`;
              }
            }
          })
          .catch((err: any) => {
            console.error("Cashfree checkout error:", err);
            setIsProcessing(false);
            setProcessingStatus("");
            alert(err.message || "Payment process was interrupted.");
          });
      } else {
        // Demo / Sandbox mode fallback when API keys are not yet configured in .env.local
        localStorage.removeItem("viraso-cart");
        localStorage.removeItem("viraso-checkout");
        setDemoBanner(true);
        setCompletedOrder(data.order);
      }
    } catch (err: any) {
      alert(err.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  if (completedOrder) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          {demoBanner && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sandbox / Test Order Mode
              </p>
              <p className="mt-1 text-slate-700">
                This order was recorded in test mode because your live Cashfree credentials have not been configured yet. Add your <code>CASHFREE_APP_ID</code> and <code>CASHFREE_SECRET_KEY</code> in <code>.env.local</code> to accept live customer payments.
              </p>
            </div>
          )}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
            Payment Completed
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
            {completedOrder.cashfreeOrderId && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-600">Cashfree Order ID:</span>
                <span className="font-mono text-xs text-slate-700">{completedOrder.cashfreeOrderId}</span>
              </div>
            )}
            {completedOrder.cashfreePaymentId && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-600">Cashfree Payment ID:</span>
                <span className="font-mono text-xs text-emerald-700 font-bold">{completedOrder.cashfreePaymentId}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-600">Payment Status:</span>
              <span className="font-bold text-emerald-700">{completedOrder.paymentStatus || "Paid"}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-slate-600">Total Paid:</span>
              <span className="font-black text-slate-900">₹{(completedOrder.totalAmount || total).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/track-order?orderNumber=${completedOrder.orderNumber || ""}`}
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
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Viraso Store</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Secure Checkout</h1>
          <p className="mt-2 text-sm text-slate-500">
            Instant UPI, Cards & NetBanking powered by Cashfree Payments
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d2946] text-xs font-bold text-white">1</span>
                Customer & Shipping Details
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                    Full Name *
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      Mobile Number (10 digits) *
                    </label>
                    <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#0d2946] focus-within:bg-white">
                      <span className="flex items-center pl-3 pr-2 text-xs font-bold text-slate-500">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        required
                        className="w-full bg-transparent py-3 pr-4 text-sm focus:outline-none"
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                    Street Address & House / Workshop No. *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                    placeholder="House / Flat / Workshop No., Street, Area"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      City / District
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      State
                    </label>
                    <input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      PIN Code
                    </label>
                    <input
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      placeholder="PIN Code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d2946] text-xs font-bold text-white">2</span>
                Payment Method
              </h2>

              <div className="mt-5 rounded-2xl border-2 border-[#0d2946] bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0d2946] bg-white">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#0d2946]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Cashfree Payment Gateway</p>
                      <p className="text-xs text-slate-500">
                        UPI (GPay, PhonePe, Paytm, BHIM), Debit & Credit Cards, NetBanking
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    Instant & Secure
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3 text-[11px] font-semibold text-slate-600">
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">GPay</span>
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">PhonePe</span>
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">Paytm</span>
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">UPI QR</span>
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">Visa / MasterCard</span>
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">RuPay</span>
                  <span className="rounded bg-white px-2 py-1 shadow-sm border border-slate-200">50+ Banks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Pay Button */}
          <aside className="h-fit rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Order Summary</h2>

            <div className="mt-6 space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Your cart is empty.{" "}
                  <Link href="/products" className="font-bold text-[#0d2946] underline">
                    Browse products
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          Viraso
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-black text-slate-900">
                <span>Final Payable</span>
                <span className="text-[#0d2946]">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing || items.length === 0}
              onClick={handlePay}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#0d2946] py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg transition hover:bg-[#071d31] disabled:opacity-60 active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{processingStatus || "Processing..."}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Pay ₹{total.toLocaleString("en-IN")} via Cashfree</span>
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a9 9 0 100 18A9 9 0 0010 1zm3.707 7.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>256-Bit SSL Encrypted • RBI Approved Gateway</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
