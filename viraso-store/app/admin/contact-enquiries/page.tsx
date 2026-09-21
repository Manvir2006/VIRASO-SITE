"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminTableShell } from "@/components/admin-table-shell";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type { ContactEnquiry, EnquiryStatus } from "@/lib/support-store";

const STATUSES: EnquiryStatus[] = [
  "New",
  "Contacted",
  "In Progress",
  "Resolved",
  "Closed",
];

export default function AdminContactEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // View Modal
  const [viewEnquiry, setViewEnquiry] = useState<ContactEnquiry | null>(null);
  const [modalStatus, setModalStatus] = useState<EnquiryStatus>("New");
  const [internalNotes, setInternalNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<ContactEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/support/enquiries", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchSearch =
        !search ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.mobile.includes(search) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === "All" || item.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [enquiries, search, selectedStatus]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewEnquiry) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/support/enquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          id: viewEnquiry.id,
          status: modalStatus,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update enquiry.");

      setToast(`Enquiry ${viewEnquiry.id} updated to ${modalStatus}.`);
      setTimeout(() => setToast(""), 4000);
      setViewEnquiry(data.enquiry);
      await loadEnquiries();
    } catch (err: any) {
      alert(err.message || "Failed to update enquiry.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/support/enquiries?id=${encodeURIComponent(deleteTarget.id)}`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );

      if (res.ok) {
        setToast(`Enquiry ${deleteTarget.id} archived.`);
        setTimeout(() => setToast(""), 4000);
        await loadEnquiries();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filterPills = [
    { label: "All Messages", active: selectedStatus === "All", onClick: () => setSelectedStatus("All"), count: enquiries.length },
    { label: "New", active: selectedStatus === "New", onClick: () => setSelectedStatus("New"), count: enquiries.filter((e) => e.status === "New").length },
    { label: "Contacted / In Progress", active: ["Contacted", "In Progress"].includes(selectedStatus), onClick: () => setSelectedStatus("In Progress"), count: enquiries.filter((e) => ["Contacted", "In Progress"].includes(e.status)).length },
    { label: "Resolved", active: selectedStatus === "Resolved", onClick: () => setSelectedStatus("Resolved"), count: enquiries.filter((e) => e.status === "Resolved").length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      <AdminTableShell
        title="Contact Enquiries"
        description="Prospective customer inquiries, distributor leads, and support messages submitted from the contact form."
        totalCount={enquiries.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search enquiry ID, name, mobile, email, subject, or message..."
        filterPills={filterPills}
        isLoading={isLoading}
        isEmpty={filteredEnquiries.length === 0}
        emptyMessage="No customer messages match your criteria."
        onResetFilters={() => {
          setSearch("");
          setSelectedStatus("All");
        }}
        actions={
          <button
            onClick={loadEnquiries}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            ↻ Refresh Messages
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Enquiry ID</th>
                <th className="px-5 py-3.5 font-bold">Sender</th>
                <th className="px-5 py-3.5 font-bold">Subject</th>
                <th className="px-5 py-3.5 font-bold">Message Preview</th>
                <th className="px-5 py-3.5 font-bold">Date Received</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnquiries.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-mono font-bold text-[#0d2946]">
                    {item.id}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.mobile}</p>
                    {item.email && <p className="text-xs text-slate-400">{item.email}</p>}
                  </td>

                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {item.subject}
                  </td>

                  <td className="px-5 py-3.5 text-slate-600 max-w-xs">
                    <p className="line-clamp-1">{item.message}</p>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.status === "New"
                          ? "bg-blue-50 text-blue-700"
                          : item.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Contacted"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewEnquiry(item);
                          setModalStatus(item.status);
                          setInternalNotes(item.internalNotes || "");
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
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

      {/* View & Reply Modal */}
      {viewEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0d2946]">Contact Message</p>
                <h3 className="text-2xl font-black text-slate-900">{viewEnquiry.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewEnquiry(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5 text-sm">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-900 text-base">{viewEnquiry.name}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                  <a href={`tel:${viewEnquiry.mobile}`} className="font-bold text-[#0d2946] hover:underline">
                    📞 {viewEnquiry.mobile}
                  </a>
                  <a href={`mailto:${viewEnquiry.email}`} className="font-bold text-[#0d2946] hover:underline">
                    ✉ {viewEnquiry.email}
                  </a>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Received on {new Date(viewEnquiry.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subject</h4>
                <p className="mt-1 text-base font-black text-slate-900">{viewEnquiry.subject}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Message Content</h4>
                <p className="mt-2 text-slate-800 whitespace-pre-wrap leading-relaxed">{viewEnquiry.message}</p>
              </div>

              <form onSubmit={handleUpdateStatus} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Workflow Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as EnquiryStatus)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Internal Follow-up Notes
                  </label>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Called customer at 2:00 PM, explained dealer wholesale pricing..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                  >
                    {isUpdating ? "Updating..." : "Save Status & Notes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AdminDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Archive Contact Message"
        itemType="Contact Enquiry"
        itemName={`${deleteTarget?.id} - ${deleteTarget?.name}`}
        itemId={deleteTarget?.id}
        consequences="This message will be removed from the active incoming inquiries queue and archived."
        confirmLabel="Confirm Archive"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
