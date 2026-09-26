import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Viraso",
  description:
    "Official Terms and Conditions for purchasing sewing machine stands and accessories on Viraso (Marjara Enterprises). Read our commercial terms, INR pricing, order handling, and governing law.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="bg-[#0d2946] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
            <span>Legal Agreement</span>
            <span>•</span>
            <span>Marjara Enterprises</span>
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Please read these terms and conditions carefully before placing orders or using the Viraso website.
          </p>
          <p className="mt-3 text-xs font-medium text-white/60">
            Last Updated: September 2026 • Governing Law: Punjab, India
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Agreement to Terms</h2>
            <p>
              This website (<span className="font-semibold text-slate-900">virasoindia.store</span>) is owned and operated by <strong className="text-slate-900">Marjara Enterprises</strong>, operating under the commercial brand name <strong className="text-slate-900">Viraso</strong>. Throughout these Terms & Conditions, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, and &ldquo;Viraso&rdquo; refer to Marjara Enterprises.
            </p>
            <p className="mt-2">
              By accessing, browsing, or placing an order on this website, you agree to be bound by these Terms & Conditions, our Privacy Policy, and our Return, Cancellation & Damage Policy. If you do not agree to all of these terms, please do not use our website or services.
            </p>
          </div>

          {/* Pricing & Products */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. Products & Pricing in INR</h2>
            <p>
              All products listed on this website—including heavy-duty sewing machine stands, cast iron wheel assemblies, wooden machine table tops, and related accessories—are described as accurately as possible.
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Pricing Currency:</strong> All prices displayed on our website are strictly listed and charged in <strong>Indian Rupees (INR / ₹)</strong>.</li>
              <li><strong>Taxes:</strong> Prices include applicable Goods and Services Tax (GST) as per Indian statutory rates.</li>
              <li><strong>Price Changes:</strong> We reserve the right to revise product prices, specifications, and availability at any time without prior notice.</li>
            </ul>
          </div>

          {/* Orders & Payments */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Orders & Payment Processing</h2>
            <p>
              When you place an order on Viraso, you agree that you are at least 18 years of age and authorized to use the chosen payment method.
            </p>
            <p className="mt-2">
              Payments are securely processed through RBI-authorized payment aggregator partners, including <strong className="text-slate-900">Cashfree Payments</strong>. Available payment modes include UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), and NetBanking.
            </p>
            <p className="mt-2">
              Viraso does not store your card PINs, CVV, or banking passwords. We reserve the right to cancel or refuse any order in the event of payment failure, technical errors, or suspected fraudulent activity.
            </p>
          </div>

          {/* Shipping & Delivery */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. Shipping & Delivery</h2>
            <p>
              Orders are packaged and dispatched across India via trusted logistics partners including Delhivery, Ekart, and Shadowfax. Standard delivery typically takes 3 to 7 business days depending on the destination pincode.
            </p>
            <p className="mt-2">
              Customers receive a tracking number upon dispatch to monitor delivery status. Please refer to our <Link href="/shipping-policy" className="font-bold text-[#0d2946] underline">Shipping & Delivery Policy</Link> for comprehensive delivery guidelines.
            </p>
          </div>

          {/* Cancellation & Returns */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Return, Cancellation & Unboxing Requirement</h2>
            <p>
              Viraso does not provide a general refund facility for change of mind or personal preference. Orders can only be cancelled before dispatch.
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              For any claim regarding transit damage, breakage, missing parts, or incorrect products received: A single continuous, uncut unboxing video starting before opening the parcel is strictly mandatory.
            </p>
            <p className="mt-2">
              All claims are subject to verification. Please review our full <Link href="/return-cancellation" className="font-bold text-[#0d2946] underline">Return, Cancellation & Damage Policy</Link> for detailed conditions.
            </p>
          </div>

          {/* Warranty */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">6. Product Warranty</h2>
            <p>
              Warranty coverage is specific to individual product models and components as stated on the relevant product listing or product packaging. Viraso does not apply a universal blanket warranty period to all goods.
            </p>
            <p className="mt-2">
              Warranty covers manufacturing defects under normal recommended usage and does not cover physical drops, intentional damage, unauthorized modification, or improper assembly. Read our <Link href="/warranty" className="font-bold text-[#0d2946] underline">Warranty Terms</Link> for details.
            </p>
          </div>

          {/* Intellectual Property */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">7. Intellectual Property</h2>
            <p>
              All content on this website—including the Viraso brand name, logos, graphics, text, product photographs, and software code—is the intellectual property of Marjara Enterprises and is protected by applicable trademark, copyright, and industrial property laws of India.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">8. Limitation of Liability</h2>
            <p>
              In no event shall Marjara Enterprises, its proprietor, directors, or employees be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website. Our total aggregate liability for any claim shall not exceed the amount paid by you for the specific product purchased.
            </p>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">9. Governing Law & Dispute Jurisdiction</h2>
            <p>
              These Terms & Conditions and any separate agreements whereby we provide you products or services shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, claim, or proceeding arising under or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-slate-900">Ludhiana, Punjab, India</strong>.
            </p>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-6">
            <h2 className="text-lg font-black text-[#0d2946] mb-3">10. Contact Details & Customer Grievances</h2>
            <p className="mb-2">For any queries regarding these Terms & Conditions or customer assistance, please reach out to us:</p>
            <div className="space-y-1 text-sm">
              <p><strong>Business Name:</strong> Marjara Enterprises (Brand: Viraso)</p>
              <p><strong>UDYAM Registration:</strong> UDYAM-PB-12-0283538</p>
              <p><strong>GSTIN:</strong> 03TIMPS1405N1ZL</p>
              <p><strong>Phone / Helpline:</strong> <a href="tel:6280377678" className="text-[#0d2946] font-bold hover:underline">6280377678</a></p>
              <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/916280377678" className="text-emerald-700 font-bold hover:underline">6280377678</a></p>
              <p><strong>Email:</strong> <a href="mailto:viraso.india@gmail.com" className="text-[#0d2946] font-bold hover:underline">viraso.india@gmail.com</a></p>
              <p><strong>Registered Address:</strong> #5598, Street No.22, Gobind Nagar, Daba Road, New Shimlapuri, Ludhiana, Punjab - 141003, India</p>
              <p><strong>Working Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
