import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Warranty | Viraso",
  description: "Warranty and support information for Viraso products.",
};

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Warranty</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Warranty & Support</h1>
        <p className="mt-6 text-lg leading-8 text-slate-700">
          Viraso is committed to customer support and product reliability. For product-related questions, product details, and support, please contact the Viraso team directly.
        </p>
        <Link href="/product-registration" className="mt-8 inline-flex rounded-full bg-[#0d2946] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]">
          Product Registration
        </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
