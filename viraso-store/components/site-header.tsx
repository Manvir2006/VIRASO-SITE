"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  { href: "/return-cancellation", label: "Return & Cancellation", icon: "🔄" },
  { href: "/support/contact", label: "Contact Us", icon: "✉️" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#0d2946] shadow-xs transition active:scale-90 hover:bg-slate-100 md:hidden touch-manipulation"
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
      </header>

      {/* MOBILE FULL-SCREEN / SLIDE-OVER DRAWER RENDERED VIA PORTAL DIRECTLY TO BODY */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] md:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <div
            className="fixed inset-y-0 right-0 z-[100000] flex w-full max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Site Navigation Menu"
          >
            {/* Drawer Header with Logo & Big Close Button */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-white">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center"
              >
                <div className="relative flex h-12 w-36 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
                  <Image
                    src="/logo/viraso-logo-cropped.png"
                    alt="Viraso logo"
                    width={180}
                    height={55}
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-slate-800 shadow-xs active:scale-90 transition hover:bg-slate-200 touch-manipulation"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-6">
              {/* Quick Actions Row */}
              <div className="flex items-center gap-2">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl bg-[#0d2946] py-3 text-center text-xs font-black uppercase tracking-wider text-white shadow-xs active:scale-95 transition"
                >
                  Shop Products →
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-[#0d2946] active:scale-95 transition"
                >
                  <span>🛒</span>
                  <span>Cart</span>
                </Link>
              </div>

              {/* Main Navigation Tabs */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">
                  Website Pages
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
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition active:scale-98 ${
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
                  <Link
                    href="/faqs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 transition active:scale-98"
                  >
                    <span>Frequently Asked Questions (FAQs)</span>
                    <span className="text-xs opacity-60">→</span>
                  </Link>
                </div>
              </div>

              {/* Customer Support Hub */}
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
                      className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-[#0d2946] hover:bg-white active:scale-95"
                    >
                      <span className="text-xl">{sub.icon}</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {sub.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* B2B Wholesale Quick Link */}
              <div className="border-t border-slate-100 pt-3">
                <Link
                  href="/b2b"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-800 hover:bg-white active:scale-95 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🏢</span>
                    <span>B2B Wholesale Inquiries</span>
                  </span>
                  <span className="text-xs text-slate-400">→</span>
                </Link>
              </div>

              {/* Direct Call / WhatsApp Helpline */}
              <div className="rounded-2xl border border-slate-200 bg-[#f5f7fb] p-4 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Direct Customer Helpline
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <a
                    href="tel:6280377678"
                    className="flex-1 rounded-xl bg-[#0d2946] py-2.5 text-xs font-bold text-white shadow-xs active:scale-95"
                  >
                    📞 Call 6280377678
                  </a>
                  <a
                    href="https://wa.me/916280377678"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95"
                  >
                    💬 WhatsApp
                  </a>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  viraso.india@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
