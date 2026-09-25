"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const complaintTypes = [
  "Product Issue",
  "Damaged Product",
  "Missing Part",
  "Wrong Product",
  "Warranty Issue",
  "Other",
];

const contactMethods = ["Phone", "Email", "WhatsApp"];

export default function ProductComplaintPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    const response = await fetch("/api/support/complaints", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      alert(payload.error || "Unable to submit complaint.");
      return;
    }

    setComplaintId(payload.complaint.id);
    setIsSubmitted(true);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

        {!isSubmitted ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Support</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Product Complaint</h1>
            <p className="mt-3 text-base text-slate-600">Share your complaint details so our team can review your purchase and resolve the issue.</p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2" encType="multipart/form-data">
              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Customer Name</span>
                <input name="customerName" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Your name" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Mobile Number</span>
                <input name="mobileNumber" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Mobile number" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Email</span>
                <input type="email" name="email" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Email address" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Order Number</span>
                <input name="orderNumber" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Order number" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Product Name</span>
                <input name="productName" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Product name" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Product ID / SKU</span>
                <input name="productIdSku" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="SKU or product ID" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Purchase Date</span>
                <input type="date" name="purchaseDate" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Complaint Type</span>
                <select name="complaintType" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {complaintTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Complaint Description</span>
                <textarea name="complaintDescription" required className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Describe the issue in detail" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Product Image Upload</span>
                <input type="file" accept="image/*" name="productImage" className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Invoice Upload (if required)</span>
                <input type="file" accept="image/*,.pdf" name="invoice" className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3" />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Preferred Contact Method</span>
                <select name="preferredContactMethod" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {contactMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2">
                <button type="submit" disabled={isSubmitting} className="inline-flex rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60">
                  {isSubmitting ? "Submitting..." : "SUBMIT COMPLAINT"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-3xl font-black text-[#111111]">Complaint Submitted Successfully</h2>
            <div className="mt-6 rounded-2xl bg-[#edf2f7] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0d2946]">Complaint ID</p>
              <p className="mt-3 text-3xl font-black tracking-[0.12em] text-[#111111]">{complaintId}</p>
            </div>
            <p className="mt-6 text-lg text-slate-600">Our support team will review your complaint.</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={`/support/track-complaint?complaintId=${encodeURIComponent(complaintId)}`} className="inline-flex rounded-full bg-[#0d2946] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]">Track This Complaint</Link>
              <Link href="/support/product-complaint" className="inline-flex rounded-full border border-[#0d2946] bg-white px-5 py-3 text-sm font-bold text-[#0d2946]">Submit Another Complaint</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  </div>
  );
}
