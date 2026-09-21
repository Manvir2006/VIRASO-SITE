"use client";

import { useEffect, useState } from "react";

const emptyLinks = { instagram: "", youtube: "", facebook: "" };

export default function AdminWebsitePage() {
	const [links, setLinks] = useState(emptyLinks);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const key = window.sessionStorage.getItem("viraso-admin-key") || "";
		fetch("/api/admin/website/social-links", { headers: { "x-admin-key": key } })
			.then((response) => response.json())
			.then((data) => data.instagram && setLinks(data))
			.catch(() => setError("Unable to load social links."));
	}, []);

	const save = async (event: React.FormEvent) => {
		event.preventDefault();
		setMessage("");
		setError("");
		const key = window.sessionStorage.getItem("viraso-admin-key") || "";
		const response = await fetch("/api/admin/website/social-links", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", "x-admin-key": key },
			body: JSON.stringify(links),
		});
		const data = await response.json();
		if (!response.ok) {
			setError(data.error || "Unable to save social links.");
			return;
		}
		setLinks(data.links);
		setMessage("Social media links saved successfully.");
	};

	return (
		<main className="mx-auto max-w-4xl">
			<div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Website</p><h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Website Management</h1><p className="mt-3 text-slate-600">Manage the social links displayed in the public website footer.</p></div>
			<div className="mb-6 flex flex-wrap gap-3"><a href="/admin/products" className="rounded-full bg-[#0d2946] px-4 py-2 text-sm font-bold text-white">Products</a><a href="/admin/products" className="rounded-full border border-[#0d2946] px-4 py-2 text-sm font-bold text-[#0d2946]">+ ADD PRODUCT</a><a href="/admin/about" className="rounded-full border border-[#0d2946] px-4 py-2 text-sm font-bold text-[#0d2946]">About Us</a><a href="/admin/contact" className="rounded-full border border-[#0d2946] px-4 py-2 text-sm font-bold text-[#0d2946]">Contact Information</a></div>
			<form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
				<h2 className="text-2xl font-black">Social Media</h2>
				<div className="mt-6 space-y-5">
					{(["instagram", "youtube", "facebook"] as const).map((platform) => <label key={platform} className="block"><span className="mb-2 block text-sm font-bold">{platform[0].toUpperCase() + platform.slice(1)} URL</span><input type="url" required value={links[platform]} onChange={(event) => setLinks({ ...links, [platform]: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>)}
				</div>
				{message && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
				{error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
				<button type="submit" className="mt-6 rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white">SAVE SOCIAL LINKS</button>
			</form>
		</main>
	);
}
