"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const groups = [
  {
    label: "Overview",
    links: [{ href: "/admin/dashboard", label: "Dashboard" }],
  },
  {
    label: "Sales & Orders",
    links: [
      { href: "/admin/orders", label: "All Orders" },
      { href: "/admin/orders?status=Pending", label: "Pending Orders" },
    ],
  },
  {
    label: "B2B / Wholesale",
    links: [
      { href: "/admin/b2b-inquiries", label: "All B2B Inquiries" },
      { href: "/admin/b2b-inquiries?status=New", label: "New Inquiries" },
      { href: "/admin/b2b-inquiries?status=Converted", label: "Converted Inquiries" },
    ],
  },
  {
    label: "Products & Stock",
    links: [
      { href: "/admin/products", label: "All Products" },
      { href: "/admin/products/add", label: "+ Add Product" },
      { href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    label: "Customers",
    links: [{ href: "/admin/customers", label: "Customers CRM" }],
  },
  {
    label: "Customer Support",
    links: [
      { href: "/admin/complaints", label: "Product Complaints" },
      { href: "/admin/contact-enquiries", label: "Contact Enquiries" },
      { href: "/admin/track-orders", label: "Track Orders" },
    ],
  },
  {
    label: "Warranty & Reg",
    links: [
      { href: "/admin/product-registrations", label: "Product Registrations" },
      { href: "/admin/warranty", label: "Warranty Management" },
    ],
  },
  {
    label: "Website & Content",
    links: [{ href: "/admin/website", label: "Website Management" }],
  },
  {
    label: "Analytics & System",
    links: [
      { href: "/admin/visitors", label: "Visitors" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/employees", label: "Employees & Roles" },
      { href: "/employee/login", label: "Employee Login Portal" },
      { href: "/admin/settings", label: "General Settings" },
      { href: "/admin/settings/couriers", label: "Courier / Tracking Settings" },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsReady(true);
      return;
    }
    const key = window.sessionStorage.getItem("viraso-admin-key");
    if (!key) {
      router.push("/admin/login");
    } else {
      setIsReady(true);
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    window.sessionStorage.removeItem("viraso-admin-key");
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex items-center gap-3 text-[#0d2946]">
          <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-bold">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-slate-800 bg-[#0d2946] px-5 py-6 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/15 pb-6">
          <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block">
            <p className="text-xl font-black tracking-[0.16em]">VIRASO</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-white/65">Admin Platform</p>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href) && !link.href.includes("?"));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        isActive
                          ? "bg-white text-[#0d2946] shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation"
            >
              ☰
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d2946]">
                Marjara Enterprises
              </p>
              <p className="text-sm font-black text-slate-900">Viraso Admin Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Authenticated
            </div>

            <Link
              href="/employee/login"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-[#0d2946] transition hover:bg-blue-100 sm:px-4 sm:py-2"
            >
              <span>👤 Employee Portal</span>
              <span>↗</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:py-2"
            >
              <span>Website</span>
              <span>↗</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#0d2946] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#071d31] sm:px-4 sm:py-2"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
