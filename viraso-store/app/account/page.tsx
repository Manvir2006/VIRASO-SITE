import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "My Account & Customer Portal | Viraso",
  description: "Access your Viraso orders, track live shipments, manage warranty registrations, or log in to Viraso portals.",
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-14 w-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image
                src="/logo/viraso-logo-cropped.png"
                alt="Viraso logo"
                width={200}
                height={65}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-none">
              <p
                className="font-viraso text-2xl font-black lowercase tracking-tight text-[#0d2946]"
                style={{ fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif' }}
              >
                viraso
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                By Marjara Enterprises
              </p>
            </div>
          </Link>

          <Link
            href="/products"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Browse Products
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0d2946] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            Customer Self-Service
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            My Account & Customer Portal
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Quickly look up your orders, access warranty services, submit complaints, or connect with our business team.
          </p>
        </div>
      </section>

      {/* Main Account Services Grid */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Customer Quick Order Access Banner */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#0d2946] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Orders & Tracking
              </span>
              <h2 className="mt-3 text-2xl font-black text-[#0d2946]">
                Have a recent order with Viraso?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                You can look up the live status of your order, dispatch details, and courier tracking (Ekart, Delhivery, Shadowfax) using only your Order ID and registered mobile number.
              </p>
            </div>
            <Link
              href="/track-order"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#0d2946] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#071d31]"
            >
              Track Order Now →
            </Link>
          </div>
        </div>

        {/* Customer Self-Service Cards */}
        <div className="mt-10">
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800">
            Customer Services
          </h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/product-registration"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#0d2946] group-hover:bg-[#0d2946] group-hover:text-white transition">
                🛡️
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0d2946]">
                Product Registration
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Register your newly purchased sewing stand or machine to activate official manufacturer warranty.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#0d2946] group-hover:underline">
                Register Now →
              </span>
            </Link>

            <Link
              href="/warranty"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#0d2946] group-hover:bg-[#0d2946] group-hover:text-white transition">
                📜
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0d2946]">
                Warranty Coverage
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                View policy guidelines, terms of service, and warranty coverage details for Marjara Enterprises products.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#0d2946] group-hover:underline">
                View Policy →
              </span>
            </Link>

            <Link
              href="/support/product-complaint"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#0d2946] group-hover:bg-[#0d2946] group-hover:text-white transition">
                ⚠️
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0d2946]">
                File a Complaint / Part Claim
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Received a damaged box or missing component? Submit photos and details directly to our technical team.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#0d2946] group-hover:underline">
                Submit Complaint →
              </span>
            </Link>

            <Link
              href="/b2b-inquiry"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#0d2946] group-hover:bg-[#0d2946] group-hover:text-white transition">
                🏢
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0d2946]">
                B2B & Wholesale Orders
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Place direct bulk purchase inquiries with our factory sales department for retail dealerships and commercial tailoring.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#0d2946] group-hover:underline">
                B2B Inquiry →
              </span>
            </Link>

            <Link
              href="/contact"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#0d2946] group-hover:bg-[#0d2946] group-hover:text-white transition">
                💬
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0d2946]">
                Customer Support Desk
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Need help choosing the right stand model or have delivery questions? Reach our Ludhiana customer helpline.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#0d2946] group-hover:underline">
                Get Support →
              </span>
            </Link>

            <Link
              href="/faqs"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#0d2946] group-hover:bg-[#0d2946] group-hover:text-white transition">
                ❓
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0d2946]">
                Frequently Asked Questions
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Browse our knowledge base for answers on machine compatibility, shipping timelines, and stand maintenance.
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-[#0d2946] group-hover:underline">
                View FAQs →
              </span>
            </Link>
          </div>
        </div>

        {/* Staff & Administration Portal Links */}
        <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900">
            Internal Staff & Portal Access
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Are you a Viraso employee or system administrator?
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/employee/login"
              className="rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              👤 Employee Login Portal
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              🔒 Admin Platform Login
            </Link>
          </div>
        </div>
      </section>

      {/* Unified Site Footer */}
      <SiteFooter />
    </main>
  );
}
