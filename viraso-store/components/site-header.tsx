"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SupportNav } from "@/components/support-nav";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/warranty", label: "Warranty" },
  { href: "/product-registration", label: "Registration" },
  { href: "/support/contact", label: "Contact" },
];

const supportSubLinks = [
  { href: "/support/product-complaint", label: "Product Complaint", icon: "⚠️" },
  { href: "/support/track-complaint", label: "Track Your Complaint", icon: "🔍" },
  { href: "/support/track-order", label: "Track Your Order", icon: "🚚" },
  { href: "/support/contact", label: "Contact Us", icon: "✉️" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-14 w-36 sm:h-16 sm:w-44 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
            <Image
              src="/logo/viraso-logo-cropped.png"
              alt="Viraso logo"
              width={200}
              height={70}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <p
              className="font-viraso text-xl sm:text-2xl font-black lowercase tracking-tight text-[#0d2946]"
              style={{
                fontFamily:
                  '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif',
              }}
            >
              viraso
            </p>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              By Marjara Enterprises
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Tabs (Hidden on mobile) */}
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#111111] md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${
                  active
                    ? "text-[#0d2946] border-b-2 border-[#0d2946] pb-0.5"
                    : "text-slate-700 hover:text-[#0d2946]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Support Dropdown */}
          <div className="hidden sm:block">
            <SupportNav />
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-[#0d2946] shadow-xs transition hover:border-[#0d2946]"
            aria-label="View Shopping Cart"
          >
            🛒
          </Link>

          {/* Desktop "Shop Products" CTA button */}
          <Link
            href="/products"
            className="hidden rounded-full bg-[#0d2946] px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#071d31] md:inline-flex shadow-xs"
          >
            Shop Products
          </Link>

          {/* MOBILE THREE LINES HAMBURGER BUTTON (☰) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0d2946] shadow-xs transition hover:bg-slate-50 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open all navigation tabs"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              // Close (X) Icon
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Three Lines (Hamburger ☰) Icon
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER / SLIDE-DOWN MENU (SHOWS ALL TABS WHEN THREE LINES CLICKED) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
            style={{ top: "65px" }}
          />

          {/* Mobile Menu Content Panel */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[calc(100vh-65px)] overflow-y-auto border-b border-slate-200 bg-white shadow-2xl transition-all duration-300 md:hidden"
            style={{ top: "65px" }}
          >
            <div className="p-5 space-y-6">
              {/* Quick Actions Row */}
              <div className="flex items-center gap-2">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl bg-[#0d2946] py-3 text-center text-xs font-black uppercase tracking-wider text-white shadow-xs"
                >
                  Shop Products →
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-[#0d2946]"
                >
                  <span>🛒</span>
                  <span>Cart</span>
                </Link>
              </div>

              {/* Main Navigation Tabs */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">
                  Navigation Tabs
                </p>
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const active =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
                          active
                            ? "bg-[#0d2946] text-white shadow-xs"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <span>{link.label}</span>
                        <span className="text-xs opacity-60">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Support & Services Tabs */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">
                  Customer Support Hub
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {supportSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-[#0d2946] hover:bg-white"
                    >
                      <span className="text-xl">{sub.icon}</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {sub.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account, B2B & Admin Quick Links */}
              <div className="border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <span>👤</span>
                    <span>My Account</span>
                  </Link>

                  <Link
                    href="/b2b"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <span>🏢</span>
                    <span>B2B Wholesale</span>
                  </Link>
                </div>

                <div className="mt-2">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-[#0d2946] hover:bg-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>🔑</span>
                      <span>Admin Management Portal</span>
                    </span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>

              {/* Direct Call / WhatsApp Contact Footer */}
              <div className="rounded-2xl border border-slate-200 bg-[#f5f7fb] p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Need Help? Call Us Directly
                </p>
                <a
                  href="tel:6280377678"
                  className="mt-1 block text-lg font-black text-[#0d2946]"
                >
                  📞 6280377678
                </a>
                <p className="mt-1 text-[11px] text-slate-500">
                  viraso.india@gmail.com
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
