"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminNotificationCenter } from "@/components/admin-notification-center";

const groups = [
  {
    label: "Overview",
    icon: "📊",
    links: [{ href: "/admin/dashboard", label: "Dashboard", icon: "📈" }],
  },
  {
    label: "Sales & Orders",
    icon: "📦",
    links: [
      { href: "/admin/orders", label: "All Orders", icon: "📑" },
      { href: "/admin/orders?status=Pending", label: "Pending Orders", icon: "⏳" },
    ],
  },
  {
    label: "B2B / Wholesale",
    icon: "💼",
    links: [
      { href: "/admin/b2b-inquiries", label: "All B2B Inquiries", icon: "🏢" },
      { href: "/admin/b2b-inquiries?status=New", label: "New Inquiries", icon: "✨" },
      { href: "/admin/b2b-inquiries?status=Converted", label: "Converted Deals", icon: "🤝" },
    ],
  },
  {
    label: "Products & Stock",
    icon: "🏷️",
    links: [
      { href: "/admin/products", label: "All Products", icon: "🛍️" },
      { href: "/admin/products/add", label: "+ Add Product", icon: "➕" },
      { href: "/admin/inventory", label: "Inventory Stock", icon: "📊" },
    ],
  },
  {
    label: "Customers",
    icon: "👥",
    links: [{ href: "/admin/customers", label: "Customers CRM", icon: "📇" }],
  },
  {
    label: "Customer Support",
    icon: "🎧",
    links: [
      { href: "/admin/complaints", label: "Product Complaints", icon: "⚠️" },
      { href: "/admin/contact-enquiries", label: "Contact Enquiries", icon: "✉️" },
      { href: "/admin/track-orders", label: "Track Orders", icon: "🚚" },
    ],
  },
  {
    label: "Warranty & Reg",
    icon: "🛡️",
    links: [
      { href: "/admin/product-registrations", label: "Product Registrations", icon: "📋" },
      { href: "/admin/warranty", label: "Warranty Management", icon: "🔖" },
    ],
  },
  {
    label: "Website & Content",
    icon: "🌐",
    links: [{ href: "/admin/website", label: "Website Management", icon: "🖥️" }],
  },
  {
    label: "Analytics & System",
    icon: "⚙️",
    links: [
      { href: "/admin/visitors", label: "Live Visitors", icon: "👀" },
      { href: "/admin/reports", label: "Sales Reports", icon: "📊" },
      { href: "/admin/employees", label: "Employees & Roles", icon: "🔑" },
      { href: "/employee/login", label: "Employee Portal", icon: "👤" },
      { href: "/admin/settings", label: "General Settings", icon: "⚙️" },
      { href: "/admin/settings/couriers", label: "Courier Integration", icon: "🚚" },
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

  const isNavActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111] pb-16 lg:pb-0">
      {/* Critical Inlined Fallback Styles to guarantee professional rendering under all conditions */}
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; background-color: #f5f7fb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .admin-sidebar { background-color: #0d2946; color: #ffffff; }
        .admin-sidebar a { text-decoration: none; }
        .admin-bottom-nav { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
      `}} />

      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-slate-800 bg-[#0d2946] px-5 py-6 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/15 pb-5">
          <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0d2946] font-black text-lg shadow-sm">
              V
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.16em] text-white">VIRASO</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Admin Platform</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="mt-5 space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <span className="text-xs">{group.icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  {group.label}
                </p>
              </div>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const active = isNavActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                        active
                          ? "bg-white text-[#0d2946] shadow-sm font-black"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-sm">{link.icon}</span>
                      <span>{link.label}</span>
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden shadow-xs"
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d2946]">
                Marjara Enterprises
              </p>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                Viraso Admin
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Notifications Component */}
            <AdminNotificationCenter />

            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <span>Store</span>
              <span>↗</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#0d2946] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#071d31] shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-130px)]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Docked for high usability on smartphones) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-1.5 backdrop-blur-md lg:hidden shadow-lg">
        <div className="grid grid-cols-5 gap-1 text-center">
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              pathname === "/admin/dashboard" ? "text-[#0d2946] font-black" : "text-slate-500"
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="text-[10px] tracking-tight">Overview</span>
          </Link>

          <Link
            href="/admin/orders"
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              pathname.startsWith("/admin/orders") ? "text-[#0d2946] font-black" : "text-slate-500"
            }`}
          >
            <span className="text-lg">📦</span>
            <span className="text-[10px] tracking-tight">Orders</span>
          </Link>

          <Link
            href="/admin/complaints"
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              pathname.startsWith("/admin/complaints") ? "text-[#0d2946] font-black" : "text-slate-500"
            }`}
          >
            <span className="text-lg">⚠️</span>
            <span className="text-[10px] tracking-tight">Complaints</span>
          </Link>

          <Link
            href="/admin/b2b-inquiries"
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              pathname.startsWith("/admin/b2b-inquiries") ? "text-[#0d2946] font-black" : "text-slate-500"
            }`}
          >
            <span className="text-lg">💼</span>
            <span className="text-[10px] tracking-tight">B2B Leads</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center py-1 rounded-xl text-slate-500 hover:text-[#0d2946]"
          >
            <span className="text-lg">☰</span>
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
