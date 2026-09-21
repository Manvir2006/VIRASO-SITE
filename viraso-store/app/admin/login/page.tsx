"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const trimmedKey = key.trim();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: trimmedKey }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Invalid admin access key.");
      return;
    }
    window.sessionStorage.setItem("viraso-admin-key", trimmedKey);
    router.push("/admin/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">
          Viraso Admin Platform
        </p>
        <h1 className="mt-4 text-3xl font-black">Admin Login</h1>
        <p className="mt-3 text-sm text-slate-600">
          Enter your private admin access key to continue.
        </p>
        <input
          autoFocus
          required
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#0d2946] focus:bg-white focus:outline-none"
          placeholder="Admin access key"
        />
        <button
          disabled={loading}
          className="mt-4 w-full rounded-full bg-[#0d2946] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60"
        >
          {loading ? "Checking..." : "Sign In"}
        </button>
        {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-500">
            Are you a Viraso team member or employee?
          </p>
          <Link
            href="/employee/login"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-[#0d2946] transition hover:border-[#0d2946] hover:bg-white"
          >
            <span>👤 Employee Login Portal</span>
            <span>→</span>
          </Link>
        </div>
      </form>
    </main>
  );
}
