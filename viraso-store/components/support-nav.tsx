"use client";

import Link from "next/link";
import { useState } from "react";

const supportLinks = [
  { href: "/support/product-complaint", label: "Product Complaint" },
  { href: "/support/track-complaint", label: "Track Your Complaint" },
  { href: "/support/track-order", label: "Track Your Order" },
  { href: "/return-cancellation", label: "Return & Cancellation" },
  { href: "/support/contact", label: "Contact" },
];

export function SupportNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0d2946] transition hover:border-[#0d2946]"
      >
        Support
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {supportLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#edf2f7] hover:text-[#0d2946]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
