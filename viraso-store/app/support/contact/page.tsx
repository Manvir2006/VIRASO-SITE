"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ContactSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    const response = await fetch("/api/support/contact", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        mobile: formData.get("mobile"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setIsSubmitting(false);
    const payload = await response.json();

    if (!response.ok) {
      alert(payload.error || "Unable to send message.");
      return;
    }

    setEnquiryId(payload.enquiry.id);
    setSubmitted(true);
    form.reset();
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-16 w-44 sm:w-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image
                src="/logo/viraso-logo-cropped.png"
                alt="Viraso logo"
                width={220}
                height={75}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span className="font-viraso text-2xl font-black lowercase tracking-tight text-[#0d2946]" style={{ fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif' }}>viraso</span>
          </Link>
          <Link href="/products" className="inline-flex rounded-full bg-[#0d2946] px-4 py-2 text-sm font-bold text-white">Back to Products</Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Support</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Contact</h1>
            <div className="mt-8 space-y-6 text-base text-slate-700">
              <p><span className="font-bold text-[#111111]">Phone:</span> 6280377678</p>
              <p><span className="font-bold text-[#111111]">WhatsApp:</span> 6280377678</p>
              <p><span className="font-bold text-[#111111]">Email:</span> viraso.india@gmail.com</p>
              <p><span className="font-bold text-[#111111]">GSTIN:</span> 03TIMPS1405N1ZL</p>
              <p><span className="font-bold text-[#111111]">UDYAM No.:</span> UDYAM-PB-12-0283538</p>
              <p><span className="font-bold text-[#111111]">Address:</span> #5598, Street No.22, Gobind Nagar, Daba Road, New Shimalpuri, Ludhiana 141003</p>
              <p><span className="font-bold text-[#111111]">Business Hours:</span> Monday to Saturday, 9:00 AM to 6:00 PM</p>
            </div>
          </div>

          {!submitted ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
              <h2 className="text-3xl font-black text-[#111111]">Send Message</h2>
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Name</span>
                  <input name="name" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Your name" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Mobile</span>
                  <input name="mobile" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Mobile number" />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Email</span>
                  <input type="email" name="email" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Email address" />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Subject</span>
                  <input name="subject" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Subject" />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Message</span>
                  <textarea name="message" required className="min-h-[150px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Write your message" />
                </label>

                <div className="md:col-span-2">
                  <button type="submit" disabled={isSubmitting} className="inline-flex rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60">
                    {isSubmitting ? "Sending..." : "SEND MESSAGE"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-black text-[#111111]">Message Sent Successfully</h2>
              <div className="mt-6 rounded-2xl bg-[#edf2f7] p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0d2946]">Enquiry ID</p>
                <p className="mt-3 text-3xl font-black tracking-[0.12em] text-[#111111]">{enquiryId}</p>
              </div>
              <p className="mt-6 text-lg text-slate-600">Our team will review your enquiry and contact you soon.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
