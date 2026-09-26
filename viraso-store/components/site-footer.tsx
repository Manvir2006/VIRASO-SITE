"use client";

import Link from "next/link";
import Image from "next/image";
import { FollowUs } from "./follow-us";

const quickLinks = [
  { href: "/products", label: "Products" },
  { href: "/track-order", label: "Track Order" },
  { href: "/product-registration", label: "Product Registration" },
  { href: "/warranty", label: "Warranty" },
  { href: "/return-cancellation", label: "Refunds & Cancellations" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/support/product-complaint", label: "Product Complaint" },
  { href: "/support/track-complaint", label: "Track Complaint" },
  { href: "/contact", label: "Contact Us" },
  { href: "/b2b-inquiry", label: "B2B / Wholesale" },
  { href: "/about", label: "About Viraso" },
  { href: "/faqs", label: "FAQs" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--brand-border)] bg-[var(--brand-black,#111111)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Branding & Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white p-1 shadow-sm">
              <Image
                src="/logo/Untitled design (1).jpg"
                alt="Viraso logo"
                width={80}
                height={80}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <p
                className="font-viraso text-2xl font-black lowercase tracking-tight text-white"
                style={{
                  fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif',
                }}
              >
                viraso
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                By Marjara Enterprises
              </p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/70">
            A product of Marjara Enterprises. Built for reliable sewing performance, durable quality, and practical everyday value across India.
          </p>
          <div className="text-xs text-white/50 space-y-1">
            <p><strong>UDYAM:</strong> UDYAM-PB-12-0283538</p>
            <p><strong>GSTIN:</strong> 03TIMPS1405N1ZL</p>
          </div>
        </div>

        {/* Quick Links (Clean 2-column grid on mobile & desktop) */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Quick links & Policies
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:gap-x-6 sm:gap-y-3 text-sm text-white/75">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-1 transition-colors hover:text-white hover:underline focus:outline-none focus:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Business & Support Column */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Support & Business
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>
              <span className="text-xs text-white/50 block">Helpline:</span>
              <a href="tel:6280377678" className="font-semibold text-white hover:underline">
                📞 6280377678
              </a>
            </li>
            <li>
              <span className="text-xs text-white/50 block">WhatsApp:</span>
              <a href="https://wa.me/916280377678" target="_blank" rel="noreferrer" className="font-semibold text-emerald-400 hover:underline">
                💬 6280377678
              </a>
            </li>
            <li>
              <span className="text-xs text-white/50 block">Email:</span>
              <a href="mailto:viraso.india@gmail.com" className="font-semibold text-white hover:underline">
                viraso.india@gmail.com
              </a>
            </li>
            <li className="pt-2">
              <Link
                href="/b2b-inquiry"
                className="inline-block rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                Bulk & Wholesale Inquiries →
              </Link>
            </li>
          </ul>
        </div>

        {/* Social / Follow Us */}
        <div>
          <FollowUs />
        </div>
      </div>

      {/* Bottom Copyright & Policy Bar (Explicitly displays all Whitelisting required policies) */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-sm text-white/60 sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <p>
            © {currentYear} Viraso (Marjara Enterprises). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-white/65">
            <Link
              href="/contact"
              className="transition-colors hover:text-white hover:underline"
            >
              Contact Us
            </Link>
            <span>•</span>
            <Link
              href="/terms-and-conditions"
              className="transition-colors hover:text-white hover:underline"
            >
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link
              href="/return-cancellation"
              className="transition-colors hover:text-white hover:underline"
            >
              Refunds & Cancellations
            </Link>
            <span>•</span>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-white hover:underline"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/shipping-policy"
              className="transition-colors hover:text-white hover:underline"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
