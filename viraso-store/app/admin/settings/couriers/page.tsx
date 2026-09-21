"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import { resolveTrackingUrl, type CourierPartner, type CourierIdentifierType } from "@/lib/courier-utils";

export default function AdminCourierSettingsPage() {
  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<CourierPartner | null>(null);
  const [name, setName] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [identifierType, setIdentifierType] = useState<CourierIdentifierType>("courier_awb");
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Test URL preview inside modal
  const [sampleOrderId, setSampleOrderId] = useState("VIR12345");
  const [sampleAwb, setSampleAwb] = useState("FMPC6262218117");

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<CourierPartner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadCouriers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/couriers", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setCouriers(data.couriers || []);
    } catch (err) {
      console.error("Failed to load couriers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCouriers();
  }, []);

  const openAddModal = () => {
    setEditingCourier(null);
    setName("");
    setTrackingUrl("https://example.com/track/{TRACKING_ID}");
    setIdentifierType("courier_awb");
    setIsActive(true);
    setLogoUrl("");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (c: CourierPartner) => {
    setEditingCourier(c);
    setName(c.name);
    setTrackingUrl(c.tracking_url);
    setIdentifierType(c.identifier_type || (c.url_type as any) || "courier_awb");
    setIsActive(c.is_active);
    setLogoUrl(c.logo_url || "");
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        ...(editingCourier ? { id: editingCourier.id } : {}),
        name: name.trim(),
        tracking_url: trackingUrl.trim(),
        identifier_type: identifierType,
        url_type: identifierType,
        is_active: isActive,
        logo_url: logoUrl.trim() || undefined,
      };

      const res = await fetch("/api/admin/couriers", {
        method: editingCourier ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save courier.");

      setToast(
        editingCourier
          ? `Courier "${name}" updated successfully.`
          : `New courier "${name}" created and saved to database.`
      );
      setTimeout(() => setToast(""), 4000);
      setModalOpen(false);
      await loadCouriers();
    } catch (err: any) {
      setError(err.message || "Failed to save courier.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (c: CourierPartner) => {
    try {
      const res = await fetch("/api/admin/couriers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          id: c.id,
          is_active: !c.is_active,
        }),
      });
      if (res.ok) {
        setToast(
          !c.is_active
            ? `Courier "${c.name}" enabled.`
            : `Courier "${c.name}" disabled from customer tracking.`
        );
        setTimeout(() => setToast(""), 4000);
        await loadCouriers();
      }
    } catch (err) {
      console.error("Toggle active failed:", err);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= couriers.length) return;

    const reordered = [...couriers];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setCouriers(reordered);

    try {
      await fetch("/api/admin/couriers/reorder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          orderedIds: reordered.map((c) => c.id),
        }),
      });
    } catch (err) {
      console.error("Reorder failed:", err);
      await loadCouriers();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/couriers?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": key() },
      });
      if (res.ok) {
        setToast(`Courier "${deleteTarget.name}" removed.`);
        setTimeout(() => setToast(""), 4000);
        await loadCouriers();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Preview resolved URL in real-time
  const previewSampleUrl = resolveTrackingUrl(
    {
      id: "preview",
      name: name || "Courier",
      tracking_url: trackingUrl || "https://example.com/track/{TRACKING_ID}",
      url_type: identifierType,
      identifier_type: identifierType,
      is_active: true,
      display_order: 1,
      created_at: "",
      updated_at: "",
    },
    {
      orderNumber: sampleOrderId,
      trackingNumber: sampleAwb,
    }
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Settings
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-[#0d2946]">Courier / Tracking Settings</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Courier Tracking Partners
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Control courier companies and external tracking URL templates. When customers track an order using their <b>Order ID + Mobile Number</b>, the system automatically redirects them to the matching courier tracking page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/track-order"
            target="_blank"
            className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Open Customer Track Order ↗
          </Link>
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-full bg-[#0d2946] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#071d31] shadow-sm"
          >
            + Add Courier
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Configured Courier Partners</h2>
            <p className="text-xs text-slate-500">Order controls the display order in admin and customer views.</p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            {couriers.filter((c) => c.is_active).length} Active of {couriers.length} Total
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-500">
            Loading courier configurations...
          </div>
        ) : couriers.length === 0 ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-500">
            No courier partners found. Click &quot;+ Add Courier&quot; above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
                <tr>
                  <th className="w-16 px-4 py-3.5 text-center font-bold">Order</th>
                  <th className="px-5 py-3.5 font-bold">Courier Name</th>
                  <th className="px-5 py-3.5 font-bold">Tracking URL / Template</th>
                  <th className="px-5 py-3.5 font-bold">Identifier Type</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {couriers.map((courier, index) => {
                  const idType = courier.identifier_type || (courier.url_type as any) || "courier_awb";
                  return (
                    <tr key={courier.id} className="transition hover:bg-slate-50/70">
                      {/* Order Controls */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOrder(index, "up")}
                            className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-20"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <span className="w-4 text-center font-mono font-bold text-slate-700">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === couriers.length - 1}
                            onClick={() => handleMoveOrder(index, "down")}
                            className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-20"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                      </td>

                      {/* Courier Name */}
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{courier.name}</p>
                      </td>

                      {/* Tracking URL */}
                      <td className="px-5 py-3.5 max-w-md">
                        <p className="font-mono text-xs text-slate-700 break-all">
                          {courier.tracking_url}
                        </p>
                        {courier.tracking_url.includes("{TRACKING_ID}") && (
                          <span className="mt-0.5 inline-block text-[10px] font-bold text-blue-600">
                            Template uses {"{TRACKING_ID}"}
                          </span>
                        )}
                      </td>

                      {/* Identifier Type */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            idType === "viraso_order_id"
                              ? "bg-emerald-50 text-emerald-800"
                              : idType === "courier_awb"
                              ? "bg-blue-50 text-blue-800"
                              : "bg-purple-50 text-purple-800"
                          }`}
                        >
                          {idType === "viraso_order_id"
                            ? "Viraso Order ID"
                            : idType === "courier_awb"
                            ? "Courier Tracking/AWB"
                            : "Tracking Page Only"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            courier.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              courier.is_active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {courier.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(courier)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(courier)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                              courier.is_active
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {courier.is_active ? "Disable" : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(courier)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                {editingCourier ? `Edit Courier: ${editingCourier.name}` : "Add Courier Partner"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                ✕ {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              {/* Courier Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Courier Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ekart, Delhivery, Shadowfax..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Tracking Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tracking URL Template * (Must begin with https://)
                </label>
                <input
                  type="url"
                  required
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://example.com/track/{TRACKING_ID}"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Use <code className="font-bold text-[#0d2946]">{`{TRACKING_ID}`}</code> where the ID should be placed.
                </p>
              </div>

              {/* Tracking Identifier Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tracking Identifier Type
                </label>
                <div className="mt-2 space-y-2.5">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                      identifierType === "viraso_order_id"
                        ? "border-[#0d2946] bg-blue-50/50 ring-1 ring-[#0d2946]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="identifier_type"
                      checked={identifierType === "viraso_order_id"}
                      onChange={() => setIdentifierType("viraso_order_id")}
                      className="mt-0.5 accent-[#0d2946]"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Viraso Order ID</p>
                      <p className="text-[11px] text-slate-500">
                        Inserts the Viraso Order ID (e.g. VIR12345) directly into the courier tracking link.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                      identifierType === "courier_awb"
                        ? "border-[#0d2946] bg-blue-50/50 ring-1 ring-[#0d2946]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="identifier_type"
                      checked={identifierType === "courier_awb"}
                      onChange={() => setIdentifierType("courier_awb")}
                      className="mt-0.5 accent-[#0d2946]"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Courier Tracking / AWB</p>
                      <p className="text-[11px] text-slate-500">
                        Uses the courier AWB / tracking number stored by Admin in the order details.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                      identifierType === "page_only"
                        ? "border-[#0d2946] bg-blue-50/50 ring-1 ring-[#0d2946]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="identifier_type"
                      checked={identifierType === "page_only"}
                      onChange={() => setIdentifierType("page_only")}
                      className="mt-0.5 accent-[#0d2946]"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Courier Tracking Page Only</p>
                      <p className="text-[11px] text-slate-500">
                        Opens the courier&apos;s official tracking page without inserting an ID (e.g. Shadowfax).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status
                </label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={isActive}
                      onChange={() => setIsActive(true)}
                      className="accent-[#0d2946]"
                    />
                    Active (Enabled)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={!isActive}
                      onChange={() => setIsActive(false)}
                      className="accent-[#0d2946]"
                    />
                    Inactive (Disabled)
                  </label>
                </div>
              </div>

              {/* Live URL Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Live URL Preview
                  </p>
                  <div className="flex items-center gap-2 text-[10px]">
                    {identifierType === "viraso_order_id" ? (
                      <input
                        type="text"
                        value={sampleOrderId}
                        onChange={(e) => setSampleOrderId(e.target.value)}
                        placeholder="Sample Order ID"
                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={sampleAwb}
                        onChange={(e) => setSampleAwb(e.target.value)}
                        placeholder="Sample AWB"
                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px]"
                      />
                    )}
                  </div>
                </div>
                <p className="mt-2 font-mono text-[11px] text-slate-800 break-all">
                  {previewSampleUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-[#0d2946] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Courier?"
        itemType="Courier Partner"
        itemName={deleteTarget?.name || ""}
        itemId={deleteTarget?.id}
        consequences={`Are you sure you want to remove ${deleteTarget?.name} from the available courier partners? If existing customer orders have this courier, historical data will remain intact.`}
        confirmLabel="Confirm Delete"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
