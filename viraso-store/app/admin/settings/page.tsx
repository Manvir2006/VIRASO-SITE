import Link from "next/link";

export default function AdminSettingsPage() {
  const sections = [
    {
      title: "Courier / Tracking Settings",
      description: "Manage delivery partners (Ekart, Delhivery, Shadowfax, etc.), tracking URL templates, and active statuses.",
      href: "/admin/settings/couriers",
      action: "Manage Couriers →",
      tag: "Live Sync",
      badgeColor: "bg-blue-100 text-[#0d2946]",
    },
    {
      title: "Website & Social Links",
      description: "Configure social media links (Instagram, YouTube, Facebook) and store footer content.",
      href: "/admin/website",
      action: "Open Website Settings →",
      tag: "Content",
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      title: "Employees & Access Roles",
      description: "Review staff user accounts, permissions, and administrative access credentials.",
      href: "/admin/employees",
      action: "Manage Roles →",
      tag: "Security",
      badgeColor: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Settings</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Platform Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure delivery partners, website metadata, roles, and platform integrations.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946] hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${section.badgeColor}`}>
                  {section.tag}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">{section.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href={section.href}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0d2946] hover:underline"
              >
                {section.action}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
