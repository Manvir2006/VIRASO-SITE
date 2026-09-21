"use client";

import { useEffect, useState } from "react";

const statuses = ["New", "Under Review", "Need More Information", "Approved", "Rejected", "Resolved"];

export default function AdminComplaintDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/admin/support/complaints")
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.complaints || []);
      })
      .catch(() => setComplaints([]));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch("/api/admin/support/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, internalNotes: note }),
    });

    if (response.ok) {
      const result = await response.json();
      const updated = complaints.map((item) => (item.id === id ? result.complaint : item));
      setComplaints(updated);
      if (selected && selected.id === id) {
        setSelected(result.complaint);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-12 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Admin</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Support & Product Complaints</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#edf2f7] text-[#111111]">
                <tr>
                  <th className="px-4 py-3">Complaint ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-t border-slate-200 hover:bg-slate-50" onClick={() => setSelected(complaint)}>
                    <td className="px-4 py-3 font-bold text-[#0d2946]">{complaint.id}</td>
                    <td className="px-4 py-3">{complaint.customerName}</td>
                    <td className="px-4 py-3">{complaint.mobileNumber}</td>
                    <td className="px-4 py-3">{complaint.productName}</td>
                    <td className="px-4 py-3">{complaint.complaintType}</td>
                    <td className="px-4 py-3">{new Date(complaint.submittedAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#edf2f7] px-2 py-1 text-xs font-bold">{complaint.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Complaint Details</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <p><span className="font-bold text-[#111111]">ID:</span> {selected.id}</p>
                <p><span className="font-bold text-[#111111]">Customer:</span> {selected.customerName}</p>
                <p><span className="font-bold text-[#111111]">Mobile:</span> {selected.mobileNumber}</p>
                <p><span className="font-bold text-[#111111]">Order:</span> {selected.orderNumber}</p>
                <p><span className="font-bold text-[#111111]">Product:</span> {selected.productName}</p>
                <p><span className="font-bold text-[#111111]">Product ID:</span> {selected.productIdSku}</p>
                <p><span className="font-bold text-[#111111]">Type:</span> {selected.complaintType}</p>
                <p><span className="font-bold text-[#111111]">Date:</span> {new Date(selected.submittedAt).toLocaleString("en-IN")}</p>
                <p><span className="font-bold text-[#111111]">Description:</span> {selected.complaintDescription}</p>
              </div>

              {selected.productImageUrl && (
                <div className="mt-5">
                  <p className="font-bold text-[#111111]">Product Image</p>
                  <img src={selected.productImageUrl} alt="Complaint product" className="mt-2 max-h-48 rounded-xl border border-slate-200" />
                </div>
              )}

              {selected.invoiceUrl && (
                <div className="mt-5">
                  <p className="font-bold text-[#111111]">Invoice</p>
                  <a href={selected.invoiceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-[#0d2946] underline">Open invoice</a>
                </div>
              )}

              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal notes..." className="mt-5 min-h-[90px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" />

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Status</label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" defaultValue={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
