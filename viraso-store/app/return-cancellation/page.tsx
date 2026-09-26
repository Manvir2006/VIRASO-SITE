import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Return, Cancellation & Damage Policy | Viraso",
  description:
    "Official Return, Cancellation & Damage Policy for Viraso by Marjara Enterprises. Information on order cancellations, transit damage, mandatory uncut unboxing video requirements, and claim verification.",
};

export default function ReturnCancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="bg-[#0d2946] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
            <span>Official Policy</span>
            <span>•</span>
            <span>Marjara Enterprises</span>
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Return, Cancellation & Damage Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Simple, clear, and transparent terms regarding order cancellations, transit damage, mandatory unboxing video requirements, and claim verification.
          </p>
          <p className="mt-3 text-xs font-medium text-white/60">
            Brand: Viraso • Manufacturer: Marjara Enterprises • Effective Date: September 2026
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Critical Summary / Highlights Box */}
        <div className="mb-10 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-6 shadow-xs sm:p-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl">⚠️</span>
            <div>
              <h2 className="text-lg font-black text-amber-950 sm:text-xl">
                Important Customer Notice
              </h2>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-amber-900">
                <p>
                  <strong>• No General Refund Policy:</strong> Viraso does not offer a general refund facility for products purchased through the website. Returns or refunds are not provided for change of mind or personal preference.
                </p>
                <p>
                  <strong>• Mandatory Unboxing Video:</strong> An uncut, continuous unboxing video is mandatory for damage, breakage, missing-part, and wrong-product claims.
                </p>
                <p>
                  <strong>• Verification:</strong> Claims are subject to verification by Viraso / Marjara Enterprises before any resolution is approved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 10 Numbered Policy Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                1
              </span>
              <h2 className="text-xl font-black text-slate-900">
                No General Refund Policy
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Viraso does not offer a general refund facility for products purchased through the website.
              </p>
              <p>
                Customers cannot request a return, refund, or exchange simply because they changed their mind, experienced buyer’s remorse, or no longer want or need the product after placing an order or receiving delivery.
              </p>
              <p className="font-semibold text-slate-900">
                Viraso does not provide an unconditional money-back guarantee or general refund facility. All purchases made through the website are considered firm commercial orders.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                2
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Order Cancellation
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Orders can only be cancelled <strong>before dispatch</strong>, strictly subject to the current processing status of the order.
              </p>
              <p>
                Once an order has been packed, assigned an airway bill (AWB), handed over to our courier partner, or dispatched/shipped, <strong>cancellation may not be possible</strong>.
              </p>
              <p>
                If you wish to request an order cancellation, you must contact Viraso as soon as possible after placing your order, providing your <strong>Order ID</strong> and <strong>Registered Mobile Number</strong> via our phone helpline or WhatsApp at <a href="tel:6280377678" className="font-bold text-[#0d2946] underline">6280377678</a> or email at <a href="mailto:viraso.india@gmail.com" className="font-bold text-[#0d2946] underline">viraso.india@gmail.com</a>.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                3
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Damaged / Broken Product (Transit Damage)
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                If a customer receives a damaged, broken, defective, tampered, or physically damaged product, they must contact Viraso promptly after delivery.
              </p>

              <div className="rounded-xl border border-red-200 bg-red-50/70 p-5">
                <h3 className="font-black uppercase tracking-wider text-red-900 text-xs sm:text-sm">
                  IMPORTANT MANDATORY REQUIREMENT:
                </h3>
                <p className="mt-2 font-bold text-red-950">
                  A FULL, CONTINUOUS AND UNCUT UNBOXING VIDEO IS MANDATORY FOR ANY DAMAGE / BREAKAGE / MISSING-PART / WRONG-PRODUCT CLAIM.
                </p>
                <p className="mt-2 text-xs sm:text-sm text-red-900">
                  The unboxing video must strictly satisfy all of the following conditions:
                </p>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-red-950">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Start <strong>BEFORE</strong> opening the parcel or package.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Clearly show the complete outer packaging in its received condition.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Clearly show the shipping label and order label (readable name, address, tracking number).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Show all sides of the package where possible.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Show the complete opening and unboxing process step-by-step.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Continue continuously without cuts, edits, pauses that hide the opening process, or video transitions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Clearly show the product immediately upon removal from the packaging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Clearly show any damage, breakage, missing parts, or incorrect product in detail.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✓</span>
                    <span>Show the complete contents and accessories received inside the package.</span>
                  </li>
                </ul>
                <p className="mt-3 font-bold text-red-900 text-xs sm:text-sm">
                  The video must be a single continuous, uncut recording. If there is no complete continuous unboxing video, the claim may not be accepted.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                4
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Missing Parts or Accessories
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Viraso sewing machine stands and accessories are packaged with specific hardware, fixings, and components. For any claim regarding missing parts or accessories:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                <li>The customer must provide the <strong>complete uncut unboxing video</strong>.</li>
                <li>The customer must provide the valid <strong>Order Number</strong>.</li>
                <li>The customer should clearly show the package contents in the video to substantiate the missing component.</li>
                <li>Viraso will review the claim and provide appropriate replacement parts or assistance upon verification.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                5
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Wrong Product Delivered
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                If the customer receives an incorrect product or model different from the one ordered:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                <li>Contact Viraso promptly after receipt of the shipment.</li>
                <li>Provide the Viraso <strong>Order Number</strong> and invoice details.</li>
                <li>Provide clear photographs and video of the received item and box labels.</li>
                <li>Provide the <strong>complete uncut unboxing video</strong>.</li>
                <li>Viraso will review the claim and take appropriate action where the claim is verified.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                6
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Product Damage Occurring After Delivery
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Damage caused after delivery, improper handling, incorrect installation or assembly, misuse, unauthorized modification, accidents, dropping, or normal wear and tear is <strong>not automatically treated as transit damage</strong>.
              </p>
              <p>
                Such cases are not eligible for transit damage claims and may only be handled according to the applicable product warranty, if any.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                7
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Warranty Terms
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Warranty claims are strictly subject to the warranty terms applicable to the specific product purchased.
              </p>
              <p>
                Viraso does not apply one universal warranty period to every product. Different product models, machine tables, cast iron frames, and accessories have their own individual coverage terms.
              </p>
              <p>
                Please refer to the specific warranty information displayed on the relevant product page or in your official product documentation. For more information, visit our <Link href="/warranty" className="font-bold text-[#0d2946] underline">Warranty Page</Link> and complete your <Link href="/product-registration" className="font-bold text-[#0d2946] underline">Product Registration</Link>.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                8
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Claim Review & Verification Process
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p className="font-semibold text-slate-900">
                All damage, breakage, missing-part, defective-product, and wrong-product claims are subject to verification by Viraso / Marjara Enterprises.
              </p>
              <p>
                Providing a video does not automatically guarantee acceptance of a claim.
              </p>
              <p>
                Viraso reserves the right to request additional photographs, videos, order details, invoice information, courier receipts, or other information necessary to thoroughly verify the authenticity and eligibility of the claim.
              </p>
              <p className="font-bold text-slate-800">
                Claims are subject to verification.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                9
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Shipping & Delivery Issues
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Customers should carefully inspect the external parcel at the time of delivery where possible.
              </p>
              <p>
                If the parcel appears severely damaged, crushed, punctured, or tampered with by the courier service, the customer should record the outer condition clearly (photographs and video) before accepting or before opening the package.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="rounded-2xl border-2 border-[#0d2946]/20 bg-[#f8fafc] p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2946] text-sm font-black text-white">
                10
              </span>
              <h2 className="text-xl font-black text-[#0d2946]">
                Customer Support & Contact Information
              </h2>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand & Manufacturer</p>
                  <p className="text-base font-bold text-slate-900">Viraso</p>
                  <p className="text-xs text-slate-500">A Product of Marjara Enterprises</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Helpline / Phone</p>
                  <a href="tel:6280377678" className="text-base font-bold text-[#0d2946] hover:underline">
                    📞 6280377678
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">WhatsApp Support</p>
                  <a href="https://wa.me/916280377678" target="_blank" rel="noreferrer" className="text-base font-bold text-emerald-700 hover:underline">
                    💬 6280377678
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                  <a href="mailto:viraso.india@gmail.com" className="text-sm font-bold text-[#0d2946] hover:underline">
                    ✉️ viraso.india@gmail.com
                  </a>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Office Address</p>
                  <p className="text-slate-900 leading-relaxed font-medium">
                    #5598, Street No.22,<br />
                    Gobind Nagar, Daba Road,<br />
                    New Shimlapuri,<br />
                    Ludhiana, Punjab - 141003<br />
                    India
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Business Hours</p>
                  <p className="font-semibold text-slate-900">Monday to Saturday: 9:00 AM to 6:00 PM</p>
                  <p className="text-xs text-slate-500">Closed on Sundays and National Holidays</p>
                </div>
              </div>
            </div>

            {/* Quick Action Support Links */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
              <Link
                href="/support/product-complaint"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d2946] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#071d31]"
              >
                <span>⚠️</span>
                <span>Submit Product Complaint</span>
              </Link>
              <Link
                href="/support/track-complaint"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                <span>🔍</span>
                <span>Track Complaint Status</span>
              </Link>
              <Link
                href="/support/track-order"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                <span>🚚</span>
                <span>Track Order</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
