import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Viraso",
  description:
    "Official Privacy Policy for Viraso (Marjara Enterprises). Learn how we protect customer data, handle secure payments, and comply with Indian IT regulations.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="bg-[#0d2946] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
            <span>Data Protection</span>
            <span>•</span>
            <span>Marjara Enterprises</span>
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            How Viraso collects, protects, and handles your personal information in compliance with Indian Information Technology regulations.
          </p>
          <p className="mt-3 text-xs font-medium text-white/60">
            Last Updated: September 2026 • Compliant with Indian IT Act, 2000
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Commitment */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Our Commitment to Your Privacy</h2>
            <p>
              At <strong className="text-slate-900">Viraso</strong> (a brand operated by <strong className="text-slate-900">Marjara Enterprises</strong>), we take customer privacy very seriously. We are committed to safeguarding personal information collected through our official website (<span className="font-semibold text-slate-900">virasoindia.store</span>).
            </p>
            <p className="mt-2">
              This Privacy Policy explains what information we collect, why we collect it, how it is secured, and your rights in relation to your data.
            </p>
          </div>

          {/* Information Collected */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. Information We Collect</h2>
            <p>When you browse, register products, or make a purchase on our website, we may collect the following details:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Contact & Shipping Details:</strong> Full name, mobile number, email address, shipping and billing address, city, state, and pincode.</li>
              <li><strong>Order Details:</strong> Purchased items, order quantities, invoice numbers, delivery preferences, and transaction IDs.</li>
              <li><strong>B2B Inquiries:</strong> Company/firm name, business address, GSTIN (optional), and estimated monthly requirement.</li>
              <li><strong>Support Inquiries:</strong> Details and unboxing videos or images submitted for complaints, warranty registration, or order tracking.</li>
            </ul>
          </div>

          {/* Payment Security */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Payment Information & Security</h2>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950">
              <p className="font-bold flex items-center gap-1.5">
                <span>🔒</span>
                <span>Bank-Grade Payment Security</span>
              </p>
              <p className="mt-1 text-xs sm:text-sm text-emerald-900">
                Viraso does <strong>NOT</strong> collect, store, or have access to your credit/debit card numbers, CVV codes, UPI MPINs, or NetBanking passwords.
              </p>
            </div>
            <p className="mt-3">
              All payment transactions are encrypted and processed through RBI-authorized payment aggregators (including <strong className="text-slate-900">Cashfree Payments</strong>) utilizing industry-standard 256-bit SSL encryption adhering to PCI-DSS compliance.
            </p>
          </div>

          {/* Use of Information */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. How We Use Your Information</h2>
            <p>We use your information solely for legitimate commercial and customer service purposes:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Processing, fulfilling, and delivering your sewing machine stand orders.</li>
              <li>Sending order confirmations, tracking links, and delivery status updates via SMS, WhatsApp, or email.</li>
              <li>Issuing GST-compliant tax invoices for your purchase.</li>
              <li>Providing after-sales support, warranty registration, and handling customer complaints.</li>
              <li>Responding to wholesale and B2B commercial inquiries.</li>
            </ul>
          </div>

          {/* Third-Party Disclosure */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Data Sharing & Third Parties</h2>
            <p>
              We do <strong>not sell, rent, or trade</strong> your personal information to third parties for marketing purposes. Your data is only shared with trusted service providers necessary to operate our business:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Logistics Partners:</strong> Courier companies (such as Delhivery, Ekart, Shadowfax) strictly to deliver your parcels.</li>
              <li><strong>Payment Aggregators:</strong> Cashfree Payments to verify and process online payments securely.</li>
              <li><strong>Legal Compliance:</strong> When required by Indian statutory authorities or court orders.</li>
            </ul>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">6. Cookies & Local Storage</h2>
            <p>
              Our website uses cookies and browser local storage to maintain shopping cart items, facilitate checkout, and analyze website traffic for speed and functionality. You can manage or disable cookies through your browser settings.
            </p>
          </div>

          {/* Grievance Officer */}
          <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-6">
            <h2 className="text-lg font-black text-[#0d2946] mb-3">7. Grievance Officer & Contact Details</h2>
            <p className="mb-2 text-xs text-slate-500">
              In accordance with the Information Technology Act, 2000 and rules made thereunder:
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Entity:</strong> Marjara Enterprises (Brand: Viraso)</p>
              <p><strong>Grievance Officer:</strong> Manvir Singh (Marjara Enterprises)</p>
              <p><strong>Phone:</strong> <a href="tel:6280377678" className="text-[#0d2946] font-bold hover:underline">6280377678</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/916280377678" className="text-emerald-700 font-bold hover:underline">6280377678</a></p>
              <p><strong>Email:</strong> <a href="mailto:viraso.india@gmail.com" className="text-[#0d2946] font-bold hover:underline">viraso.india@gmail.com</a></p>
              <p><strong>Address:</strong> #5598, Street No.22, Gobind Nagar, Daba Road, New Shimlapuri, Ludhiana, Punjab - 141003, India</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
