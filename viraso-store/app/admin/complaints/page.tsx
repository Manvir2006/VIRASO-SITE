"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { AdminTableShell } from "@/components/admin-table-shell";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type { ComplaintRecord, ComplaintStatus } from "@/lib/support-store";

const STATUSES: ComplaintStatus[] = [
  "New",
  "Under Review",
  "Need More Information",
  "Approved",
  "Rejected",
  "Resolved",
];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // View / Manage Modal
  const [viewComplaint, setViewComplaint] = useState<ComplaintRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<ComplaintStatus>("New");
  const [internalNotes, setInternalNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<ComplaintRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/support/complaints", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchSearch =
        !search ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.mobileNumber.includes(search) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.complaintType.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === "All" || item.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [complaints, search, selectedStatus]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewComplaint) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/support/complaints", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          id: viewComplaint.id,
          status: modalStatus,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update complaint.");

      setToast(`Complaint ${viewComplaint.id} updated to ${modalStatus}.`);
      setTimeout(() => setToast(""), 4000);
      setViewComplaint(data.complaint);
      await loadComplaints();
    } catch (err: any) {
      alert(err.message || "Failed to update complaint.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/support/complaints?id=${encodeURIComponent(deleteTarget.id)}`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );

      if (res.ok) {
        setToast(`Complaint ${deleteTarget.id} archived.`);
        setTimeout(() => setToast(""), 4000);
        await loadComplaints();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filterPills = [
    { label: "All Complaints", active: selectedStatus === "All", onClick: () => setSelectedStatus("All"), count: complaints.length },
    { label: "New", active: selectedStatus === "New", onClick: () => setSelectedStatus("New"), count: complaints.filter((c) => c.status === "New").length },
    { label: "Under Review", active: selectedStatus === "Under Review", onClick: () => setSelectedStatus("Under Review"), count: complaints.filter((c) => c.status === "Under Review").length },
    { label: "Approved / Info Needed", active: ["Need More Information", "Approved"].includes(selectedStatus), onClick: () => setSelectedStatus("Need More Information"), count: complaints.filter((c) => ["Need More Information", "Approved"].includes(c.status)).length },
    { label: "Resolved", active: selectedStatus === "Resolved", onClick: () => setSelectedStatus("Resolved"), count: complaints.filter((c) => c.status === "Resolved").length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      <AdminTableShell
        title="Product Complaints"
        description="Support tickets and product defect claims submitted via the customer website."
        totalCount={complaints.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search complaint ID, customer name, mobile, order #, or defect..."
        filterPills={filterPills}
        isLoading={isLoading}
        isEmpty={filteredComplaints.length === 0}
        emptyMessage="No product complaints match your criteria."
        onResetFilters={() => {
          setSearch("");
          setSelectedStatus("All");
        }}
        actions={
          <button
            onClick={loadComplaints}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            ↻ Refresh Complaints
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Ticket ID</th>
                <th className="px-5 py-3.5 font-bold">Customer</th>
                <th className="px-5 py-3.5 font-bold">Product & Order</th>
                <th className="px-5 py-3.5 font-bold">Issue Type</th>
                <th className="px-5 py-3.5 font-bold">Submitted Date</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-mono font-bold text-[#0d2946]">
                    {item.id}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{item.customerName}</p>
                    <p className="text-xs text-slate-500">{item.mobileNumber}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{item.productName}</p>
                    {item.orderNumber && (
                      <p className="font-mono text-xs text-slate-500">Order: {item.orderNumber}</p>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-slate-700">
                    <span className="font-semibold">{item.complaintType}</span>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    {new Date(item.submittedAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.status === "New"
                          ? "bg-blue-50 text-blue-700"
                          : item.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
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
                          setViewComplaint(item);
                          setModalStatus(item.status);
                          setInternalNotes(item.internalNotes || "");
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                      >
                        Manage
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

      {/* View & Manage Modal */}
      {viewComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0d2946]">Complaint Ticket</p>
                <h3 className="text-2xl font-black text-slate-900">{viewComplaint.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewComplaint(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</h4>
                  <p className="mt-1 font-bold text-slate-900">{viewComplaint.customerName}</p>
                  <p className="text-xs text-slate-600">Mobile: {viewComplaint.mobileNumber}</p>
                  <p className="text-xs text-slate-600">Email: {viewComplaint.email}</p>
                  <p className="text-xs text-slate-600">Preferred Contact: {viewComplaint.preferredContactMethod || "Phone"}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Product & Order</h4>
                  <p className="mt-1 font-bold text-slate-900">{viewComplaint.productName}</p>
                  <p className="text-xs text-slate-600">Order #: {viewComplaint.orderNumber || "Direct / Offline"}</p>
                  <p className="text-xs text-slate-600">Purchase Date: {viewComplaint.purchaseDate || "Not provided"}</p>
                  <p className="text-xs text-slate-600 font-semibold">Issue: {viewComplaint.complaintType}</p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Description</h4>
                <p className="mt-2 text-slate-800 whitespace-pre-wrap leading-relaxed">{viewComplaint.complaintDescription}</p>
              </div>

              {/* Uploaded Evidence (Photos / Invoice) */}
              {(viewComplaint.productImageUrl || viewComplaint.invoiceUrl) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Attached Evidence</h4>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {viewComplaint.productImageUrl && (
                      <a
                        href={viewComplaint.productImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center"
                      >
                        <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-200">
                          <Image src={viewComplaint.productImageUrl} alt="Product defect" fill className="object-cover" />
                        </div>
                        <p className="mt-1 text-[11px] font-bold text-[#0d2946] group-hover:underline">View Photo ↗</p>
                      </a>
                    )}

                    {viewComplaint.invoiceUrl && (
                      <a
                        href={viewComplaint.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center"
                      >
                        <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-200">
                          <Image src={viewComplaint.invoiceUrl} alt="Invoice copy" fill className="object-cover" />
                        </div>
                        <p className="mt-1 text-[11px] font-bold text-[#0d2946] group-hover:underline">View Invoice ↗</p>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status and Notes Update Form */}
              <form onSubmit={handleUpdateStatus} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Update Complaint Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as ComplaintStatus)}
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
                    Internal Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Contacted customer, dispatched replacement component on 22-09-2026..."
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
        title="Archive Complaint Ticket"
        itemType="Complaint"
        itemName={`${deleteTarget?.id} - ${deleteTarget?.customerName}`}
        itemId={deleteTarget?.id}
        consequences="This ticket will be archived from the active support queue. Defect audit records will be kept."
        confirmLabel="Confirm Archive"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
