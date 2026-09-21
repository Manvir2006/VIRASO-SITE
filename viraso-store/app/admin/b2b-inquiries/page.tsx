"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type { B2BInquiryRecord, B2BInquiryStatus, PurchaseFrequency } from "@/lib/b2b-store";

const STATUS_LIST: B2BInquiryStatus[] = [
  "New",
  "Contacted",
  "Quotation Sent",
  "Negotiation",
  "Converted",
  "Closed",
  "Not Interested",
];

const FREQUENCY_OPTIONS: PurchaseFrequency[] = [
  "Regular Bulk Purchase",
  "Monthly",
  "Quarterly",
  "One Time",
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

export default function AdminB2BInquiriesPage() {
  const searchParams = useSearchParams();
  const initialStatusParam = searchParams.get("status") || "All";

  const [inquiries, setInquiries] = useState<B2BInquiryRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    contacted: 0,
    quotationSent: 0,
    negotiation: 0,
    converted: 0,
    closed: 0,
    notInterested: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusParam);
  const [stateFilter, setStateFilter] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // View / Open Modal
  const [viewInquiry, setViewInquiry] = useState<B2BInquiryRecord | null>(null);
  const [quickNote, setQuickNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Edit Modal
  const [editInquiry, setEditInquiry] = useState<B2BInquiryRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<B2BInquiryRecord>>({});

  // Delete Modal
  const [deleteInquiry, setDeleteInquiry] = useState<B2BInquiryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "All") params.set("status", statusFilter);
      if (stateFilter) params.set("state", stateFilter);
      if (frequencyFilter && frequencyFilter !== "All") params.set("frequency", frequencyFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/b2b-inquiries?${params.toString()}`, {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load inquiries.");

      setInquiries(data.inquiries || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to fetch B2B inquiries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, stateFilter, frequencyFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openViewModal = (item: B2BInquiryRecord) => {
    setViewInquiry(item);
    setQuickNote(item.admin_notes || "");
  };

  const openEditModal = (item: B2BInquiryRecord) => {
    setEditInquiry(item);
    setEditForm({ ...item });
  };

  const handleStatusChange = async (inquiryId: string, newStatus: B2BInquiryStatus) => {
    try {
      const res = await fetch("/api/admin/b2b-inquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({ id: inquiryId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");

      setToast(`Status changed to "${newStatus}" successfully.`);
      setTimeout(() => setToast(""), 4000);
      loadData();

      if (viewInquiry && viewInquiry.id === inquiryId) {
        setViewInquiry(data.inquiry);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleSaveQuickNote = async () => {
    if (!viewInquiry) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/admin/b2b-inquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({ id: viewInquiry.id, admin_notes: quickNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note.");

      setViewInquiry(data.inquiry);
      setToast("Internal admin note saved successfully.");
      setTimeout(() => setToast(""), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleConvertToCustomer = async (inquiryId: string) => {
    setIsConverting(true);
    try {
      const res = await fetch("/api/admin/b2b-inquiries/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({ id: inquiryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert inquiry.");

      setToast("✓ B2B inquiry successfully converted and connected to Customer CRM profile.");
      setTimeout(() => setToast(""), 5000);
      loadData();

      if (viewInquiry && viewInquiry.id === inquiryId) {
        setViewInquiry(data.inquiry);
      }
    } catch (err: any) {
      alert(err.message || "Failed to convert inquiry.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInquiry) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch("/api/admin/b2b-inquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({ id: editInquiry.id, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update inquiry.");

      setEditInquiry(null);
      setToast("B2B inquiry updated successfully.");
      setTimeout(() => setToast(""), 4000);
      loadData();

      if (viewInquiry && viewInquiry.id === editInquiry.id) {
        setViewInquiry(data.inquiry);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update inquiry.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteInquiry) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/b2b-inquiries?id=${encodeURIComponent(deleteInquiry.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete inquiry.");

      setDeleteInquiry(null);
      if (viewInquiry && viewInquiry.id === deleteInquiry.id) {
        setViewInquiry(null);
      }
      setToast("B2B inquiry deleted successfully.");
      setTimeout(() => setToast(""), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeClass = (st: B2BInquiryStatus) => {
    switch (st) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contacted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Quotation Sent":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Negotiation":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Converted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 font-black";
      case "Closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Not Interested":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">B2B / Wholesale Inquiries</h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage bulk orders, procurement quotes, corporate sewing equipment requirements and customer conversion.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/b2b-inquiry"
            target="_blank"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0d2946] shadow-sm hover:bg-slate-50 transition"
          >
            Open Public Form ↗
          </Link>
          <button
            onClick={() => loadData()}
            className="rounded-full bg-[#0d2946] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#071d31] transition"
          >
            Refresh Inquiries
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          ✕ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <button
          onClick={() => setStatusFilter("All")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "All" ? "border-[#0d2946] bg-[#edf2f7]" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
        </button>

        <button
          onClick={() => setStatusFilter("New")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "New" ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">New</p>
          <p className="mt-1 text-2xl font-black text-blue-900">{stats.newCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter("Contacted")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "Contacted" ? "border-purple-600 bg-purple-50" : "border-slate-200 bg-white hover:border-purple-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Contacted</p>
          <p className="mt-1 text-2xl font-black text-purple-900">{stats.contacted}</p>
        </button>

        <button
          onClick={() => setStatusFilter("Quotation Sent")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "Quotation Sent" ? "border-amber-600 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Quote Sent</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{stats.quotationSent}</p>
        </button>

        <button
          onClick={() => setStatusFilter("Negotiation")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "Negotiation" ? "border-orange-600 bg-orange-50" : "border-slate-200 bg-white hover:border-orange-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Negotiation</p>
          <p className="mt-1 text-2xl font-black text-orange-900">{stats.negotiation}</p>
        </button>

        <button
          onClick={() => setStatusFilter("Converted")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "Converted" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Converted</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">{stats.converted}</p>
        </button>

        <button
          onClick={() => setStatusFilter("Closed")}
          className={`rounded-2xl border p-4 text-left transition shadow-sm ${
            statusFilter === "Closed" ? "border-slate-600 bg-slate-100" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Closed</p>
          <p className="mt-1 text-2xl font-black text-slate-800">{stats.closed}</p>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Search Inquiries
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID, company, name, phone, email, GST, city..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#0d2946] px-4 py-2 text-xs font-bold text-white hover:bg-[#071d31]"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Frequency
            </label>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
            >
              <option value="All">All Frequencies</option>
              {FREQUENCY_OPTIONS.map((fq) => (
                <option key={fq} value={fq}>
                  {fq}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Inquiries Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Inquiry ID</th>
                <th className="px-5 py-3.5">Company / Business</th>
                <th className="px-5 py-3.5">Contact Person</th>
                <th className="px-5 py-3.5">Contact Info</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Monthly Qty</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                    Loading B2B inquiries...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No B2B inquiries match your current filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-[#0d2946] text-xs">
                        {inq.inquiry_number}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(inq.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{inq.company_name}</p>
                      {inq.gst_number ? (
                        <p className="text-[10px] font-mono text-slate-500">GST: {inq.gst_number}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No GST registered</p>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {inq.contact_person_name}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-mono text-slate-800 font-semibold">{inq.mobile}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{inq.email}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{inq.city}</p>
                      <p className="text-[10px] text-slate-400">{inq.state}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-black text-slate-900">{inq.monthly_quantity}</span>
                      <p className="text-[10px] text-slate-400">{inq.purchase_frequency}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeClass(
                          inq.status
                        )}`}
                      >
                        {inq.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(inq)}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0d2946] hover:bg-blue-100 transition"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => openEditModal(inq)}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteInquiry(inq)}
                          className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW / OPEN INQUIRY MODAL */}
      {viewInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-black text-[#0d2946]">
                    {viewInquiry.inquiry_number}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadgeClass(
                      viewInquiry.status
                    )}`}
                  >
                    {viewInquiry.status}
                  </span>
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {viewInquiry.company_name}
                </h2>
                <p className="text-xs text-slate-500">
                  Received on {new Date(viewInquiry.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={() => setViewInquiry(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Quick Contact Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
                Quick Actions:
              </span>
              <a
                href={`tel:${viewInquiry.mobile}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-100"
              >
                📞 Call Customer ({viewInquiry.mobile})
              </a>
              <a
                href={`mailto:${viewInquiry.email}?subject=Viraso%20B2B%20Inquiry%20-%20${viewInquiry.inquiry_number}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-100"
              >
                ✉ Email Customer
              </a>
              <a
                href={`https://wa.me/91${viewInquiry.whatsapp_number || viewInquiry.mobile}?text=Hello%20${encodeURIComponent(
                  viewInquiry.contact_person_name
                )}%2C%20regarding%20your%20Viraso%20B2B%20inquiry%20${viewInquiry.inquiry_number}...`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              >
                💬 WhatsApp ({viewInquiry.whatsapp_number || viewInquiry.mobile})
              </a>
              {viewInquiry.status !== "Converted" ? (
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={() => handleConvertToCustomer(viewInquiry.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isConverting ? "Converting..." : "★ Convert to Customer"}
                </button>
              ) : (
                <Link
                  href={`/admin/customers?search=${encodeURIComponent(viewInquiry.mobile)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800"
                >
                  ✓ Linked in Customer CRM →
                </Link>
              )}
            </div>

            {/* Content Details Grid */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 text-xs">
              {/* BUSINESS INFORMATION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  1. Business Information
                </h3>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Company Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{viewInquiry.company_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">GST Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {viewInquiry.gst_number || "Not Registered / Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Address:</span>
                  <span className="text-slate-700">{viewInquiry.company_address}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">City & State:</span>
                  <span className="font-semibold text-slate-800">
                    {viewInquiry.city}, {viewInquiry.state} - {viewInquiry.pin_code}
                  </span>
                </div>
                {viewInquiry.website && (
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Website:</span>
                    <a
                      href={viewInquiry.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#0d2946] underline break-all"
                    >
                      {viewInquiry.website} ↗
                    </a>
                  </div>
                )}
              </div>

              {/* CONTACT PERSON */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  2. Contact Person
                </h3>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{viewInquiry.contact_person_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Mobile:</span>
                  <span className="font-mono font-bold text-slate-800">{viewInquiry.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">WhatsApp:</span>
                  <span className="font-mono text-slate-800">
                    {viewInquiry.whatsapp_number || viewInquiry.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Email:</span>
                  <span className="font-medium text-slate-800">{viewInquiry.email}</span>
                </div>
              </div>

              {/* REQUIREMENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 sm:col-span-2">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  3. Requirements & Quantities
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Monthly Required Quantity:</span>
                    <span className="font-black text-slate-900 text-base">{viewInquiry.monthly_quantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Purchase Frequency:</span>
                    <span className="font-bold text-slate-800">{viewInquiry.purchase_frequency}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Product Requirement Specification:</span>
                  <div className="mt-1 rounded-xl bg-slate-50 p-3 font-medium text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100">
                    {viewInquiry.product_requirement}
                  </div>
                </div>
                {viewInquiry.additional_message && (
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block">Additional Requirements / Notes:</span>
                    <div className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-700 whitespace-pre-wrap border border-slate-100">
                      {viewInquiry.additional_message}
                    </div>
                  </div>
                )}
              </div>

              {/* STATUS & ADMIN NOTES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <h3 className="font-black uppercase tracking-wider text-[#0d2946]">
                    4. Lifecycle Status & Internal Audit Notes
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">Update Status:</label>
                    <select
                      value={viewInquiry.status}
                      onChange={(e) => handleStatusChange(viewInquiry.id, e.target.value as B2BInquiryStatus)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                    >
                      {STATUS_LIST.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Private Admin Internal Notes (Not visible to customer)
                  </label>
                  <textarea
                    rows={3}
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="e.g. Sent formal quotation with 12% bulk discount on 21 Sept. Client confirmed advance payment terms..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNote}
                      onClick={handleSaveQuickNote}
                      className="rounded-full bg-[#0d2946] px-5 py-2 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                    >
                      {isSavingNote ? "Saving Note..." : "Save Internal Note"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setDeleteInquiry(viewInquiry)}
                className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Delete Inquiry
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(viewInquiry)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Edit Full Details
                </button>
                <button
                  type="button"
                  onClick={() => setViewInquiry(null)}
                  className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-bold text-white hover:bg-[#071d31]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INQUIRY MODAL */}
      {editInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Edit B2B Inquiry #{editInquiry.inquiry_number}
                </h2>
                <p className="text-xs text-slate-500">Update company, contact, or requirement details</p>
              </div>
              <button
                onClick={() => setEditInquiry(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-6 space-y-6 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-slate-700 uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.company_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">GST Number</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editForm.gst_number || ""}
                    onChange={(e) => setEditForm({ ...editForm, gst_number: e.target.value.toUpperCase() })}
                    placeholder="15-character GSTIN"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Address</label>
                  <input
                    type="text"
                    required
                    value={editForm.company_address || ""}
                    onChange={(e) => setEditForm({ ...editForm, company_address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={editForm.city || ""}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">State</label>
                  <select
                    value={editForm.state || ""}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Pin Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={editForm.pin_code || ""}
                    onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Website</label>
                  <input
                    type="url"
                    value={editForm.website || ""}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.contact_person_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, contact_person_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile || ""}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editForm.whatsapp_number || ""}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Monthly Quantity</label>
                  <input
                    type="text"
                    required
                    value={editForm.monthly_quantity || ""}
                    onChange={(e) => setEditForm({ ...editForm, monthly_quantity: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Purchase Frequency</label>
                  <select
                    value={editForm.purchase_frequency || "Regular Bulk Purchase"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, purchase_frequency: e.target.value as PurchaseFrequency })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Product Requirement</label>
                  <textarea
                    rows={3}
                    required
                    value={editForm.product_requirement || ""}
                    onChange={(e) => setEditForm({ ...editForm, product_requirement: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Additional Message</label>
                  <textarea
                    rows={2}
                    value={editForm.additional_message || ""}
                    onChange={(e) => setEditForm({ ...editForm, additional_message: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Status</label>
                  <select
                    value={editForm.status || "New"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as B2BInquiryStatus })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Admin Notes</label>
                  <input
                    type="text"
                    value={editForm.admin_notes || ""}
                    onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                    placeholder="Private admin remarks"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditInquiry(null)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteInquiry && (
        <AdminDeleteModal
          isOpen={true}
          title="Delete B2B Inquiry?"
          itemType="B2B Inquiry"
          itemName={`${deleteInquiry.inquiry_number} (${deleteInquiry.company_name})`}
          itemId={deleteInquiry.inquiry_number}
          consequences="This will archive and delete this B2B inquiry record. It will no longer appear in active inquiry listings."
          confirmLabel="Delete"
          isLoading={isDeleting}
          onClose={() => setDeleteInquiry(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
