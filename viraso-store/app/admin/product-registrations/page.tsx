"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminTableShell } from "@/components/admin-table-shell";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type { ProductRegistration, RegistrationStatus } from "@/lib/product-registration-store";

const STATUS_LIST: RegistrationStatus[] = [
  "Registered",
  "Verified",
  "Under Review",
  "Non-Registered",
  "Rejected",
  "Cancelled",
];

export default function AdminProductRegistrationsPage() {
  const [registrations, setRegistrations] = useState<ProductRegistration[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    nonRegistered: 0,
    today: 0,
    month: 0,
    verified: 0,
    pending: 0,
    chart: [] as { date: string; count: number }[],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeToggle, setActiveToggle] = useState<"All" | "Registered" | "Non-Registered">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // View Modal
  const [viewItem, setViewItem] = useState<ProductRegistration | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // Edit Modal
  const [editItem, setEditItem] = useState<ProductRegistration | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDealerName, setEditDealerName] = useState("");
  const [editDealerCity, setEditDealerCity] = useState("");
  const [editPurchaseDate, setEditPurchaseDate] = useState("");

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<ProductRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/product-registrations", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setRegistrations(data.registrations || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      const searchable = [
        item.registrationId,
        item.serialNumber,
        item.customerName,
        item.mobile,
        item.email,
        item.productName,
        item.dealerName,
      ].join(" ").toLowerCase();

      const matchSearch = !search || searchable.includes(search.toLowerCase());

      const isRegistered = ["Registered", "Verified", "Under Review"].includes(item.status);
      const isNonRegistered = ["Non-Registered", "Cancelled", "Rejected"].includes(item.status);

      const matchToggle =
        activeToggle === "All" ||
        (activeToggle === "Registered" && isRegistered) ||
        (activeToggle === "Non-Registered" && isNonRegistered);

      const matchStatus = statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchToggle && matchStatus;
    });
  }, [registrations, search, activeToggle, statusFilter]);

  const handleStatusUpdate = async (registrationId: string, status: RegistrationStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/product-registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          registrationId,
          status,
          note: adminNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");

      setToast(`Registration ${registrationId} status updated to ${status}.`);
      setTimeout(() => setToast(""), 4000);
      setAdminNote("");
      if (viewItem?.registrationId === registrationId) {
        setViewItem(data.registration);
      }
      await loadRegistrations();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/product-registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          registrationId: editItem.registrationId,
          customerName: editCustomerName,
          mobile: editMobile,
          email: editEmail,
          dealerName: editDealerName,
          dealerCity: editDealerCity,
          purchaseDate: editPurchaseDate,
          note: "Customer details updated by admin",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes.");

      setToast(`Registration ${editItem.registrationId} updated successfully.`);
      setTimeout(() => setToast(""), 4000);
      setEditItem(null);
      await loadRegistrations();
    } catch (err: any) {
      alert(err.message || "Failed to update registration.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/product-registrations?id=${encodeURIComponent(deleteTarget.registrationId)}&reason=Archived by admin`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );

      if (res.ok) {
        setToast(`Registration ${deleteTarget.registrationId} archived.`);
        setTimeout(() => setToast(""), 4000);
        await loadRegistrations();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const exportCsv = async () => {
    const res = await fetch("/api/admin/product-registrations?format=csv", {
      headers: { "x-admin-key": key() },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterPills = [
    { label: "All Records", active: activeToggle === "All", onClick: () => setActiveToggle("All"), count: stats.total },
    { label: "Registered", active: activeToggle === "Registered", onClick: () => setActiveToggle("Registered"), count: stats.registered },
    { label: "Non-Registered / Cancelled", active: activeToggle === "Non-Registered", onClick: () => setActiveToggle("Non-Registered"), count: stats.nonRegistered },
    { label: "Verified Only", active: statusFilter === "Verified", onClick: () => setStatusFilter(statusFilter === "Verified" ? "All" : "Verified"), count: stats.verified },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Top Filter Stats Cards from DB */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Submissions</p>
          <p className="mt-2 text-3xl font-black text-[#0d2946]">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-400">All registered devices</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{stats.registered}</p>
          <p className="mt-1 text-xs text-slate-400">Valid warranty active</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Non-Registered</p>
          <p className="mt-2 text-3xl font-black text-slate-700">{stats.nonRegistered}</p>
          <p className="mt-1 text-xs text-slate-400">Cancelled / Rejected</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified</p>
          <p className="mt-2 text-3xl font-black text-blue-600">{stats.verified}</p>
          <p className="mt-1 text-xs text-slate-400">Proof confirmed</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today</p>
          <p className="mt-2 text-3xl font-black text-indigo-600">{stats.today}</p>
          <p className="mt-1 text-xs text-slate-400">New today ({stats.month} this mo)</p>
        </div>
      </div>

      <AdminTableShell
        title="Product Registrations"
        description="Customer warranty registrations submitted from the customer registration portal."
        totalCount={registrations.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search registration ID, serial #, customer name, mobile, product..."
        filterPills={filterPills}
        isLoading={isLoading}
        isEmpty={filteredRegistrations.length === 0}
        emptyMessage="No product registrations found matching your filters."
        onResetFilters={() => {
          setSearch("");
          setActiveToggle("All");
          setStatusFilter("All");
        }}
        actions={
          <>
            <button
              onClick={exportCsv}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Export CSV
            </button>
            <button
              onClick={loadRegistrations}
              className="rounded-full bg-[#0d2946] px-5 py-2 text-xs font-bold text-white hover:bg-[#071d31] shadow-sm"
            >
              ↻ Refresh
            </button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Reg ID & Serial #</th>
                <th className="px-5 py-3.5 font-bold">Customer</th>
                <th className="px-5 py-3.5 font-bold">Product</th>
                <th className="px-5 py-3.5 font-bold">Purchase Date</th>
                <th className="px-5 py-3.5 font-bold">Dealer</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.registrationId} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-bold text-[#0d2946]">{reg.registrationId}</p>
                    <p className="font-mono text-xs text-slate-500">S/N: {reg.serialNumber}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{reg.customerName}</p>
                    <p className="text-xs text-slate-500">{reg.mobile}</p>
                    {reg.email && <p className="text-xs text-slate-400">{reg.email}</p>}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{reg.productName}</p>
                    <p className="text-xs text-slate-500">{reg.categoryName}</p>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    {reg.purchaseDate}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-800">{reg.dealerName}</p>
                    <p className="text-xs text-slate-500">{reg.dealerCity}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        reg.status === "Registered"
                          ? "bg-emerald-50 text-emerald-700"
                          : reg.status === "Verified"
                          ? "bg-blue-50 text-blue-700"
                          : reg.status === "Under Review"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewItem(reg);
                          setAdminNote("");
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditItem(reg);
                          setEditCustomerName(reg.customerName);
                          setEditMobile(reg.mobile);
                          setEditEmail(reg.email || "");
                          setEditDealerName(reg.dealerName);
                          setEditDealerCity(reg.dealerCity);
                          setEditPurchaseDate(reg.purchaseDate);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(reg)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableShell>

      {/* View Details Drawer/Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0d2946]">Product Registration</p>
                <h3 className="text-2xl font-black text-slate-900">{viewItem.registrationId}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Details</h4>
                  <p className="mt-2 font-bold text-slate-900">{viewItem.customerName}</p>
                  <p className="text-xs text-slate-600">Mobile: {viewItem.mobile}</p>
                  <p className="text-xs text-slate-600">Email: {viewItem.email || "-"}</p>
                  <p className="text-xs text-slate-600">
                    Address: {viewItem.locality}, {viewItem.city}, {viewItem.state} {viewItem.pinCode}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Device & Purchase</h4>
                  <p className="mt-2 font-bold text-slate-900">{viewItem.productName}</p>
                  <p className="font-mono text-xs font-bold text-[#0d2946]">Serial: {viewItem.serialNumber}</p>
                  <p className="text-xs text-slate-600">Purchase Date: {viewItem.purchaseDate}</p>
                  <p className="text-xs text-slate-600">Dealer: {viewItem.dealerName} ({viewItem.dealerCity})</p>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Update Registration Status
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUS_LIST.map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(viewItem.registrationId, st)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        viewItem.status === st
                          ? "bg-[#0d2946] text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Optional internal note (private)..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#0d2946] focus:outline-none"
                  />
                </div>
              </div>

              {/* Admin Notes Log */}
              {viewItem.adminNotes && viewItem.adminNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal Audit Notes</h4>
                  <div className="mt-2 space-y-2">
                    {viewItem.adminNotes.map((note, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                        <p className="text-slate-800">{note.note}</p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          By {note.admin} on {new Date(note.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Registration Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">Edit Customer Information</h3>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Dealer Name
                  </label>
                  <input
                    type="text"
                    value={editDealerName}
                    onChange={(e) => setEditDealerName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Dealer City
                  </label>
                  <input
                    type="text"
                    value={editDealerCity}
                    onChange={(e) => setEditDealerCity(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={editPurchaseDate}
                  onChange={(e) => setEditPurchaseDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-full bg-[#0d2946] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Archive Product Registration"
        itemType="Registration"
        itemName={`${deleteTarget?.registrationId} (${deleteTarget?.customerName})`}
        itemId={deleteTarget?.serialNumber}
        consequences="This registration record will be archived and will no longer appear in the active registrations list."
        confirmLabel="Confirm Archive"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
