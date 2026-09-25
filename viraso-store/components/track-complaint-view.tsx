"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

type TrackedComplaint = {
  id: string;
  customerName: string;
  orderNumber: string;
  productName: string;
  productIdSku: string;
  purchaseDate: string;
  complaintType: string;
  complaintDescription: string;
  preferredContactMethod: string;
  status: "New" | "Under Review" | "Need More Information" | "Approved" | "Rejected" | "Resolved";
  submittedAt: string;
  updatedAt?: string;
  productImageUrl?: string;
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; step: number; desc: string }
> = {
  New: {
    label: "Complaint Received",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-700",
    step: 1,
    desc: "Your complaint has been successfully registered and queued for our quality inspection team.",
  },
  "Under Review": {
    label: "Under Review",
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    text: "text-amber-800",
    step: 2,
    desc: "A support specialist is actively inspecting your reported defect and product details.",
  },
  "Need More Information": {
    label: "Information Needed",
    bg: "bg-purple-50 text-purple-800 border-purple-200",
    text: "text-purple-800",
    step: 2,
    desc: "Our support desk has contacted you or requested additional images/clarification.",
  },
  Approved: {
    label: "Approved for Resolution",
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    text: "text-emerald-800",
    step: 3,
    desc: "Your complaint has been approved! Replacement parts or authorized service are being prepared.",
  },
  Resolved: {
    label: "Complaint Resolved",
    bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    text: "text-emerald-900",
    step: 4,
    desc: "This ticket has been completed and fully resolved. Thank you for your patience.",
  },
  Rejected: {
    label: "Closed / Ineligible",
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    text: "text-slate-700",
    step: 4,
    desc: "This complaint is closed or out of warranty coverage. Please contact our support line for assistance.",
  },
};

function TrackComplaintContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("complaintId") || searchParams.get("id") || "";

  const [complaintId, setComplaintId] = useState(initialId);
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [complaint, setComplaint] = useState<TrackedComplaint | null>(null);

  const fetchComplaint = async (idToSearch: string, mobileToSearch?: string) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) {
      setError("Please enter your Complaint ID (e.g. VC-I6ZF56).");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let url = `/api/support/track-complaint?complaintId=${encodeURIComponent(cleanId)}`;
      if (mobileToSearch && mobileToSearch.trim()) {
        url += `&mobile=${encodeURIComponent(mobileToSearch.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setComplaint(null);
        setError(data.error || "No complaint found with this Complaint ID.");
        return;
      }

      setComplaint(data.complaint);
      setError("");
    } catch (err: any) {
      console.error("Tracking request failed:", err);
      setError("Unable to retrieve complaint details. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchComplaint(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(complaintId, mobileNumber);
  };

  const handleReset = () => {
    setComplaint(null);
    setComplaintId("");
    setMobileNumber("");
    setError("");
  };

  const currentStatus = complaint
    ? statusConfig[complaint.status] || {
        label: complaint.status,
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        text: "text-slate-700",
        step: 2,
        desc: "Complaint status is currently being updated.",
      }
    : null;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Subheader Quick Links */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d2946]">Customer Support</p>
              <h1 className="text-2xl font-black text-slate-900">Track Your Complaint</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/support/product-complaint"
                className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                File New Complaint
              </Link>
              <Link
                href="/support/track-order"
                className="inline-flex rounded-full bg-[#0d2946] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#071d31]"
              >
                Track Order
              </Link>
            </div>
          </div>

        {/* Tracking Input Card */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">
              Customer Support
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">
              Track Your Complaint
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Enter your Complaint ID (provided upon submission) to check review status, inspection notes, and resolution updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                  Complaint ID *
                </label>
                <input
                  type="text"
                  required
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder="e.g. VC-I6ZF56"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm uppercase tracking-wide focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                  Registered Mobile / Email (Optional)
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter phone or email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0d2946] py-3.5 text-center text-sm font-bold uppercase tracking-[0.08em] text-white shadow-md transition hover:bg-[#071d31] disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Looking up Ticket...</span>
                </>
              ) : (
                <span>Track Complaint Status</span>
              )}
            </button>
          </form>
        </div>

        {/* Complaint Result View */}
        {complaint && currentStatus && (
          <div className="mt-8 space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Complaint Reference
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black text-[#0d2946]">
                    {complaint.id}
                  </p>
                </div>
                <div className={`rounded-full border px-4 py-1.5 text-xs font-bold ${currentStatus.bg}`}>
                  ● {currentStatus.label}
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Resolution Progress
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { step: 1, label: "Submitted" },
                    { step: 2, label: "Under Review" },
                    { step: 3, label: "Action Taken" },
                    { step: 4, label: "Resolved" },
                  ].map((s) => {
                    const isCompleted = currentStatus.step >= s.step;
                    const isCurrent = currentStatus.step === s.step;

                    return (
                      <div key={s.step} className="text-center">
                        <div
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                            isCompleted
                              ? "bg-[#0d2946] text-white shadow-sm"
                              : "bg-slate-100 text-slate-400"
                          } ${isCurrent ? "ring-4 ring-[#0d2946]/20" : ""}`}
                        >
                          {isCompleted ? "✓" : s.step}
                        </div>
                        <p
                          className={`mt-2 text-[11px] font-bold sm:text-xs ${
                            isCompleted ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Current Status Note:</p>
                  <p className="mt-1">{currentStatus.desc}</p>
                </div>
              </div>

              {/* Complaint Details Grid */}
              <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Customer Name</span>
                  <p className="font-bold text-slate-900">{complaint.customerName}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Order Number</span>
                  <p className="font-mono font-bold text-[#0d2946]">{complaint.orderNumber}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Product Affected</span>
                  <p className="font-bold text-slate-900">{complaint.productName}</p>
                  <p className="text-xs text-slate-500">SKU / ID: {complaint.productIdSku}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Complaint Category</span>
                  <p className="font-bold text-slate-900">{complaint.complaintType}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Issue Description</span>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                    {complaint.complaintDescription}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Submitted On</span>
                  <p className="text-xs font-semibold text-slate-800">
                    {new Date(complaint.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Preferred Contact</span>
                  <p className="text-xs font-bold text-[#0d2946]">{complaint.preferredContactMethod}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ← Track Another Complaint
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`https://wa.me/916280377678?text=${encodeURIComponent(
                      `Hello Viraso Support! I am inquiring about my complaint ${complaint.id} regarding order ${complaint.orderNumber}.`
                    )}`}
                    target="_blank"
                    className="inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    WhatsApp Support
                  </Link>
                  <Link
                    href="/support/contact"
                    className="inline-flex rounded-full bg-[#0d2946] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#071d31]"
                  >
                    Contact Desk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  </div>
  );
}

export function TrackComplaintView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] p-12 text-center text-slate-500">
          Loading Complaint Tracking...
        </div>
      }
    >
      <TrackComplaintContent />
    </Suspense>
  );
}
