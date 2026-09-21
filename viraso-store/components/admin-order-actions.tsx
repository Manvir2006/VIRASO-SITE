"use client";

import { useState } from "react";

const statuses = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"];

export function AdminOrderActions({ orderNumber, initialStatus }: { orderNumber: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const update = async (value: string) => {
    const key = window.sessionStorage.getItem("viraso-admin-key") || "";
    const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-key": key }, body: JSON.stringify({ orderNumber, status: value }) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || "Unable to update order.");
    else { setStatus(data.order.status); setMessage("Order status updated."); }
  };
  return <div><label className="font-black">Order Status<select value={status} onChange={(event) => update(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>{message && <p className="mt-2 text-xs text-slate-600">{message}</p>}</div>;
}
