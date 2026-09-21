"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminTableShell } from "@/components/admin-table-shell";
import type { InventoryItem, StockAdjustmentLog, StockAdjustmentType } from "@/lib/inventory-store";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<StockAdjustmentLog[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalStockUnits: 0,
    totalAvailableUnits: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"catalog" | "history">("catalog");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<StockAdjustmentType>("Add");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Threshold Edit Modal
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [newThreshold, setNewThreshold] = useState<number>(5);

  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setItems(data.items || []);
      setHistory(data.history || []);
      setStats(data.stats || stats);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || item.stockStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          productId: adjustItem.productId,
          type: adjustType,
          quantity: adjustQuantity,
          reason: adjustReason || "Stock adjustment",
          admin: "Admin",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock.");

      setToast(`Stock updated for ${adjustItem.name}. Real store inventory is synced.`);
      setTimeout(() => setToast(""), 4000);
      setAdjustItem(null);
      setAdjustReason("");
      await loadInventory();
    } catch (err: any) {
      alert(err.message || "Failed to update stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThresholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdItem) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          productId: thresholdItem.productId,
          threshold: newThreshold,
        }),
      });

      if (!res.ok) throw new Error("Failed to update threshold.");

      setToast(`Low-stock alert threshold updated to ${newThreshold} units.`);
      setTimeout(() => setToast(""), 4000);
      setThresholdItem(null);
      await loadInventory();
    } catch (err: any) {
      alert(err.message || "Failed to update threshold.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterPills = [
    { label: "All Items", active: statusFilter === "All", onClick: () => setStatusFilter("All"), count: items.length },
    { label: "In Stock", active: statusFilter === "In Stock", onClick: () => setStatusFilter("In Stock"), count: items.filter((i) => i.stockStatus === "In Stock").length },
    { label: "Low Stock", active: statusFilter === "Low Stock", onClick: () => setStatusFilter("Low Stock"), count: stats.lowStockItems },
    { label: "Out of Stock", active: statusFilter === "Out of Stock", onClick: () => setStatusFilter("Out of Stock"), count: stats.outOfStockItems },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Notification */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog SKUs</p>
          <p className="mt-2 text-3xl font-black text-[#0d2946]">{stats.totalItems}</p>
          <p className="mt-1 text-xs text-slate-400">Total managed products</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Stock Units</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{stats.totalAvailableUnits}</p>
          <p className="mt-1 text-xs text-slate-400">Ready for customer purchase</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Alert</p>
          <p className="mt-2 text-3xl font-black text-amber-600">{stats.lowStockItems}</p>
          <p className="mt-1 text-xs text-slate-400">Items below threshold</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Out of Stock</p>
          <p className="mt-2 text-3xl font-black text-red-600">{stats.outOfStockItems}</p>
          <p className="mt-1 text-xs text-slate-400">Customer checkout disabled</p>
        </div>
      </div>

      {/* View Switcher: Catalog vs History */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "catalog"
              ? "bg-[#0d2946] text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          Stock Catalog Table
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "history"
              ? "bg-[#0d2946] text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          Stock Adjustment Audit Log ({history.length})
        </button>
      </div>

      {activeTab === "catalog" ? (
        <AdminTableShell
          title="Inventory Management"
          description="Real stock management showing current, reserved (unfulfilled orders), and available stock with customizable thresholds."
          totalCount={items.length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search product SKU or name..."
          filterPills={filterPills}
          isLoading={isLoading}
          isEmpty={filteredItems.length === 0}
          emptyMessage="No inventory items match your search criteria."
          onResetFilters={() => {
            setSearch("");
            setStatusFilter("All");
          }}
          actions={
            <button
              onClick={loadInventory}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ↻ Refresh Stock
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
                <tr>
                  <th className="px-5 py-3.5 font-bold">SKU & Product</th>
                  <th className="px-5 py-3.5 font-bold">Category</th>
                  <th className="px-5 py-3.5 font-bold">Current Stock</th>
                  <th className="px-5 py-3.5 font-bold">Reserved</th>
                  <th className="px-5 py-3.5 font-bold">Available</th>
                  <th className="px-5 py-3.5 font-bold">Threshold</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.productId} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="font-mono text-xs text-slate-500">SKU: {item.sku}</p>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">{item.category}</td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      {item.currentStock} units
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {item.reservedStock} units
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {item.availableStock} units
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setThresholdItem(item);
                          setNewThreshold(item.lowStockThreshold);
                        }}
                        className="font-mono text-xs font-bold text-[#0d2946] hover:underline"
                        title="Click to edit threshold"
                      >
                        ≤ {item.lowStockThreshold}
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.stockStatus === "Out of Stock"
                            ? "bg-red-50 text-red-700"
                            : item.stockStatus === "Low Stock"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.stockStatus === "Out of Stock"
                              ? "bg-red-500"
                              : item.stockStatus === "Low Stock"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {item.stockStatus}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustItem(item);
                          setAdjustType("Add");
                          setAdjustQuantity(10);
                          setAdjustReason("");
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] transition hover:bg-slate-100"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminTableShell>
      ) : (
        /* History Log View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h3 className="text-base font-black text-slate-900">Stock Adjustment Audit Trail</h3>
            <p className="text-xs text-slate-500">Every stock modification is logged with its timestamp, admin, and rationale.</p>
          </div>

          {history.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No stock adjustments logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
                  <tr>
                    <th className="px-5 py-3 font-bold">Date & Time</th>
                    <th className="px-5 py-3 font-bold">Product</th>
                    <th className="px-5 py-3 font-bold">Type</th>
                    <th className="px-5 py-3 font-bold">Adjustment</th>
                    <th className="px-5 py-3 font-bold">Stock Change</th>
                    <th className="px-5 py-3 font-bold">Reason</th>
                    <th className="px-5 py-3 font-bold">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((log) => (
                    <tr key={log.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3 text-slate-600">
                        {new Date(log.date).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">
                        {log.productName}
                        <span className="block font-mono text-xs text-slate-500 font-normal">
                          SKU: {log.sku}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                            log.type === "Add"
                              ? "bg-emerald-50 text-emerald-700"
                              : log.type === "Reduce"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold">
                        {log.type === "Add" ? `+${log.quantity}` : log.type === "Reduce" ? `-${log.quantity}` : `Set to ${log.quantity}`}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">
                        {log.previousStock} → <span className="font-bold text-slate-900">{log.newStock}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{log.reason}</td>
                      <td className="px-5 py-3 font-semibold text-slate-700">{log.admin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Adjust Inventory</h3>
                <p className="text-xs text-slate-500">
                  {adjustItem.name} ({adjustItem.sku})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Adjustment Mode
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["Add", "Reduce", "Set"] as StockAdjustmentType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAdjustType(t)}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                        adjustType === t
                          ? "border-[#0d2946] bg-[#0d2946] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {t === "Add" ? "+ Add Stock" : t === "Reduce" ? "- Reduce" : "= Set Exact"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Math.max(1, Number(e.target.value)))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Current stock: <span className="font-bold text-slate-700">{adjustItem.currentStock} units</span>
                  {" → "}
                  New projected stock:{" "}
                  <span className="font-bold text-[#0d2946]">
                    {adjustType === "Add"
                      ? adjustItem.currentStock + adjustQuantity
                      : adjustType === "Reduce"
                      ? Math.max(0, adjustItem.currentStock - adjustQuantity)
                      : adjustQuantity}{" "}
                    units
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Adjustment Reason
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new shipment from factory, damaged in transit, etc."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#0d2946] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                >
                  {isSubmitting ? "Applying..." : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Edit Modal */}
      {thresholdItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <h3 className="text-xl font-black text-slate-900">Low Stock Alert Threshold</h3>
            <p className="mt-1 text-xs text-slate-500">
              When available units drop to or below this count, a warning badge will appear.
            </p>

            <form onSubmit={handleThresholdSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Threshold Units
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(Math.max(1, Number(e.target.value)))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setThresholdItem(null)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#0d2946] px-5 py-2 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                >
                  Save Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
