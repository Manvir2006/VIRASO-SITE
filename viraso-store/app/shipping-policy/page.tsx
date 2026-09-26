import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Viraso",
  description:
    "Official Shipping & Delivery Policy for Viraso by Marjara Enterprises. Doorstep courier delivery timelines (3-7 days), free shipping across India, and order tracking.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="bg-[#0d2946] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
            <span>Logistics & Fulfillment</span>
            <span>•</span>
            <span>Marjara Enterprises</span>
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Shipping & Delivery Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Information regarding dispatch timelines, courier tracking, and doorstep delivery for Viraso products across India.
          </p>
          <p className="mt-3 text-xs font-medium text-white/60">
            Last Updated: September 2026 • Free Shipping Across India
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Dispatch Timelines */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Order Processing & Dispatch Timelines</h2>
            <p>
              At <strong className="text-slate-900">Viraso</strong> (Marjara Enterprises), every sewing machine stand and accessory undergoes rigorous quality checking and heavy-duty protective packaging prior to dispatch.
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Processing Time:</strong> Standard retail orders are typically processed and packed within <strong>24 to 48 business hours</strong> after payment confirmation.</li>
              <li><strong>Dispatch Days:</strong> Dispatches occur Monday through Saturday, excluding Sundays and gazetted national holidays.</li>
            </ul>
          </div>

          {/* Delivery Timelines */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. Estimated Delivery Timeframes</h2>
            <p>We deliver to serviceable pin codes across all states and union territories of India through authorized surface logistics:</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-[#0d2946]">North India & Punjab / Delhi NCR</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Typically 2 to 4 business days from dispatch.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-[#0d2946]">Rest of India (Metro & Major Cities)</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Typically 4 to 7 business days from dispatch.</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              * Delivery timelines are estimates and may occasionally vary slightly due to regional weather, festive peak volumes, or local transit restrictions.
            </p>
          </div>

          {/* Shipping Charges */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Shipping Charges</h2>
            <p>
              We provide <strong>FREE standard surface delivery</strong> across all eligible pin codes in India for products ordered directly through our website. There are no hidden delivery fees added at checkout.
            </p>
          </div>

          {/* Courier Partners & Tracking */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. Logistics Partners & Live Tracking</h2>
            <p>
              We partner with India&apos;s leading e-commerce courier networks, including <strong className="text-slate-900">Delhivery, Ekart Logistics, and Shadowfax</strong>.
            </p>
            <p className="mt-2">
              Once your shipment is handed over to the courier, an SMS and WhatsApp message with your tracking Airway Bill (AWB) number and live tracking link will be generated. You can also track your shipment status at any time directly on our website:
            </p>
            <div className="mt-3">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d2946] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#071d31] transition"
              >
                <span>🚚</span>
                <span>Track Your Order Online →</span>
              </Link>
            </div>
          </div>

          {/* Inspection on Delivery */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Inspection Upon Delivery & Transit Damage</h2>
            <p>
              Due to the substantial weight of cast iron frames and wooden tables, we strongly advise customers to inspect the outer condition of the carton when the courier arrives.
            </p>
            <p className="mt-2">
              If the parcel shows signs of severe external crushing, punctures, or tampering, record external photos before accepting the parcel.
            </p>
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 text-xs sm:text-sm">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Mandatory Unboxing Video for Claims:</span>
              </p>
              <p className="mt-1">
                Per Viraso policy, an uncut, continuous unboxing video starting BEFORE opening the outer packaging is strictly mandatory for any damage, breakage, missing parts, or incorrect product claims. Claims are subject to verification.{" "}
                <Link href="/return-cancellation" className="font-bold text-[#0d2946] underline">
                  Read full Return, Cancellation & Damage Policy →
                </Link>
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-6">
            <h2 className="text-lg font-black text-[#0d2946] mb-3">6. Shipping Support & Inquiries</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Brand / Manufacturer:</strong> Viraso (Marjara Enterprises)</p>
              <p><strong>Shipping Support Phone:</strong> <a href="tel:6280377678" className="text-[#0d2946] font-bold hover:underline">6280377678</a></p>
              <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/916280377678" className="text-emerald-700 font-bold hover:underline">6280377678</a></p>
              <p><strong>Email:</strong> <a href="mailto:viraso.india@gmail.com" className="text-[#0d2946] font-bold hover:underline">viraso.india@gmail.com</a></p>
              <p><strong>Fulfillment Center:</strong> #5598, Street No.22, Gobind Nagar, Daba Road, New Shimlapuri, Ludhiana, Punjab - 141003, India</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
