"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegistrationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [registration, setRegistration] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id: routeId }) => {
      setId(routeId);
      const key = window.sessionStorage.getItem("viraso-admin-key") || "";
      fetch(`/api/admin/product-registrations?id=${encodeURIComponent(routeId)}`, { headers: { "x-admin-key": key } })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else setRegistration(data.registration);
        });
    });
  }, [params]);

  if (error) return <main className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{error}<Link href="/admin/product-registrations" className="mt-4 block font-bold underline">Back to registrations</Link></main>;
  if (!registration) return <main className="mx-auto max-w-3xl p-8 text-slate-600">Loading registration {id}...</main>;
  const sections = [["Customer Information", `Name: ${registration.customerName}\nMobile: ${registration.mobile}\nEmail: ${registration.email || "-"}\nPIN Code: ${registration.pinCode}\nCity: ${registration.city}\nState: ${registration.state}\nLocality/Town: ${registration.locality}`], ["Product Information", `Category: ${registration.categoryName}\nSub Category: ${registration.subcategoryName}\nProduct: ${registration.productName}\nSerial Number: ${registration.serialNumber}\nPurchase Date: ${registration.purchaseDate}`], ["Dealer Information", `Dealer/Seller Name: ${registration.dealerName}\nDealer/Seller City: ${registration.dealerCity}`], ["Registration Information", `Registration ID: ${registration.registrationId}\nRegistration Date: ${new Date(registration.registrationDate).toLocaleString("en-IN")}\nStatus: ${registration.status}\nLast Updated: ${new Date(registration.updatedAt).toLocaleString("en-IN")}`]];
  return <main className="mx-auto max-w-5xl"><Link href="/admin/product-registrations" className="text-sm font-bold text-[#0d2946] underline">← All Registrations</Link><h1 className="mt-6 text-4xl font-black">{registration.registrationId}</h1><div className="mt-8 grid gap-6 md:grid-cols-2">{sections.map(([title, text]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">{title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{text}</p></section>)}</div></main>;
}
