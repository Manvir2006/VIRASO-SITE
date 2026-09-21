"use client";

import { useEffect, useState } from "react";

const statuses = ["New", "Read", "In Progress", "Resolved"];

export default function AdminContactEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/admin/support/enquiries")
      .then((res) => res.json())
      .then((data) => setEnquiries(data.enquiries || []))
      .catch(() => setEnquiries([]));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch("/api/admin/support/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, internalNotes: note }),
    });

    if (response.ok) {
      const result = await response.json();
      const updated = enquiries.map((item) => (item.id === id ? result.enquiry : item));
      setEnquiries(updated);
      if (selected && selected.id === id) {
        setSelected(result.enquiry);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-12 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Admin</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Support & Contact Enquiries</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#edf2f7] text-[#111111]">
                <tr>
                  <th className="px-4 py-3">Enquiry ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-t border-slate-200 hover:bg-slate-50" onClick={() => setSelected(enquiry)}>
                    <td className="px-4 py-3 font-bold text-[#0d2946]">{enquiry.id}</td>
                    <td className="px-4 py-3">{enquiry.name}</td>
                    <td className="px-4 py-3">{enquiry.mobile}</td>
                    <td className="px-4 py-3">{enquiry.email}</td>
                    <td className="px-4 py-3">{enquiry.subject}</td>
                    <td className="px-4 py-3">{new Date(enquiry.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#edf2f7] px-2 py-1 text-xs font-bold">{enquiry.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Enquiry Details</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <p><span className="font-bold text-[#111111]">ID:</span> {selected.id}</p>
                <p><span className="font-bold text-[#111111]">Name:</span> {selected.name}</p>
                <p><span className="font-bold text-[#111111]">Mobile:</span> {selected.mobile}</p>
                <p><span className="font-bold text-[#111111]">Email:</span> {selected.email}</p>
                <p><span className="font-bold text-[#111111]">Subject:</span> {selected.subject}</p>
                <p><span className="font-bold text-[#111111]">Message:</span> {selected.message}</p>
              </div>

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
