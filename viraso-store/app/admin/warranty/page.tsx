"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminTableShell } from "@/components/admin-table-shell";
import type { WarrantyRecord, WarrantyStatus } from "@/lib/warranty-store";

export default function AdminWarrantyPage() {
  const [warranties, setWarranties] = useState<WarrantyRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Edit Warranty Modal
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRecord | null>(null);
  const [statusOverride, setStatusOverride] = useState<WarrantyStatus>("Active");
  const [notes, setNotes] = useState("");
  const [extendedMonths, setExtendedMonths] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadWarranties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/warranty", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setWarranties(data.warranties || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to load warranties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarranties();
  }, []);

  const filteredWarranties = useMemo(() => {
    return warranties.filter((item) => {
      const matchSearch =
        !search ||
        item.registrationId.toLowerCase().includes(search.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.mobile.includes(search) ||
        item.productName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [warranties, search, statusFilter]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/warranty", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          registrationId: selectedWarranty.registrationId,
          statusOverride,
          notes,
          extendedMonths,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update warranty.");

      setToast(`Warranty for ${selectedWarranty.serialNumber} updated successfully.`);
      setTimeout(() => setToast(""), 4000);
      setSelectedWarranty(null);
      await loadWarranties();
    } catch (err: any) {
      alert(err.message || "Failed to update warranty.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filterPills = [
    { label: "All Warranties", active: statusFilter === "All", onClick: () => setStatusFilter("All"), count: stats.total },
    { label: "Active", active: statusFilter === "Active", onClick: () => setStatusFilter("Active"), count: stats.active },
    { label: "Expired", active: statusFilter === "Expired", onClick: () => setStatusFilter("Expired"), count: stats.expired },
    { label: "Cancelled", active: statusFilter === "Cancelled", onClick: () => setStatusFilter("Cancelled"), count: stats.cancelled },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Warranties</p>
          <p className="mt-2 text-3xl font-black text-[#0d2946]">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-400">Derived from product registrations</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Coverage</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{stats.active}</p>
          <p className="mt-1 text-xs text-slate-400">Within valid warranty period</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired Coverage</p>
          <p className="mt-2 text-3xl font-black text-slate-600">{stats.expired}</p>
          <p className="mt-1 text-xs text-slate-400">Past warranty term</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cancelled / Void</p>
          <p className="mt-2 text-3xl font-black text-red-600">{stats.cancelled}</p>
          <p className="mt-1 text-xs text-slate-400">Revoked or non-registered</p>
        </div>
      </div>

      <AdminTableShell
        title="Warranty Management"
        description="Warranty coverage records calculated dynamically from customer registration dates and product specifications."
        totalCount={warranties.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search serial #, registration ID, customer name, mobile..."
        filterPills={filterPills}
        isLoading={isLoading}
        isEmpty={filteredWarranties.length === 0}
        emptyMessage="No warranty records match your current filters."
        onResetFilters={() => {
          setSearch("");
          setStatusFilter("All");
        }}
        actions={
          <button
            onClick={loadWarranties}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
          >
            ↻ Refresh Warranties
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Serial & Reg ID</th>
                <th className="px-5 py-3.5 font-bold">Customer</th>
                <th className="px-5 py-3.5 font-bold">Product</th>
                <th className="px-5 py-3.5 font-bold">Purchase Date</th>
                <th className="px-5 py-3.5 font-bold">Duration</th>
                <th className="px-5 py-3.5 font-bold">Expiry Date</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarranties.map((w) => (
                <tr key={w.registrationId} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-bold text-[#0d2946]">{w.serialNumber}</p>
                    <p className="font-mono text-xs text-slate-400">{w.registrationId}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{w.customerName}</p>
                    <p className="text-xs text-slate-500">{w.mobile}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{w.productName}</p>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    {w.purchaseDate}
                  </td>

                  <td className="px-5 py-3.5 text-slate-700">
                    <span className="font-semibold">{w.warrantyPeriod}</span>
                    <span className="block text-[11px] text-slate-400">({w.warrantyDurationMonths} months)</span>
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                    {w.expiryDate || "-"}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        w.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : w.status === "Expired"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWarranty(w);
                        setStatusOverride(w.status);
                        setNotes(w.notes || "");
                        setExtendedMonths(0);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableShell>

      {/* Warranty Management Modal */}
      {selectedWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0d2946]">Warranty Record</p>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedWarranty.serialNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWarranty(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                <p><span className="font-bold text-slate-800">Customer:</span> {selectedWarranty.customerName} ({selectedWarranty.mobile})</p>
                <p className="mt-1"><span className="font-bold text-slate-800">Product:</span> {selectedWarranty.productName}</p>
                <p className="mt-1"><span className="font-bold text-slate-800">Calculated Expiry:</span> {selectedWarranty.expiryDate}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Warranty Status Override
                </label>
                <select
                  value={statusOverride}
                  onChange={(e) => setStatusOverride(e.target.value as WarrantyStatus)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled / Void</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Extend Warranty (Additional Months)
                </label>
                <input
                  type="number"
                  min={0}
                  value={extendedMonths}
                  onChange={(e) => setExtendedMonths(Number(e.target.value))}
                  placeholder="0"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Warranty Claims & Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Approved free replacement belt under standard 1-year coverage..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWarranty(null)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
