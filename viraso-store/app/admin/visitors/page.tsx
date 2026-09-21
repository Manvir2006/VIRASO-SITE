import { AdminSectionPage } from "@/components/admin-section-page";
export default function AdminVisitorsPage() { return <AdminSectionPage title="Visitors & Analytics" description="Visitor analytics storage is not present in the existing project yet. This route is ready for the visitor-session store to be connected." links={[{ href: "/admin/visitors/live", label: "Live Visitors" }]}/>; }
