"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Option = { id: string; name: string; categoryId?: string; subcategoryId?: string };
type Registration = {
  registrationId: string;
  serialNumber: string;
  customerName: string;
  mobile: string;
  email: string;
  purchaseDate: string;
  productName: string;
};

const fieldClass = "w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-[#111111] outline-none transition focus:border-[#0d2946] focus:ring-2 focus:ring-[#0d2946]/10";
const labelClass = "mb-2 block text-sm font-bold text-[#111111]";

export default function ProductRegistrationPage() {
  const [categories, setCategories] = useState<Option[]>([]);
  const [subcategories, setSubcategories] = useState<Option[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Option[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/product-registration/options")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data.categories || []);
        setSubcategories(data.subcategories || []);
        setCatalogProducts(data.products || []);
      })
      .catch(() => setError("Unable to load products. Please refresh and try again."));
  }, []);

  const visibleSubcategories = useMemo(() => subcategories.filter((item) => item.categoryId === categoryId), [categoryId, subcategories]);
  const visibleProducts = useMemo(() => catalogProducts.filter((item) => item.categoryId === categoryId && item.subcategoryId === subcategoryId), [categoryId, catalogProducts, subcategoryId]);

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
    setProductId("");
  };

  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value);
    setProductId("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/product-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = await response.json();
    setIsSubmitting(false);
    if (!response.ok) {
      setError(payload.error || "Unable to register product.");
      return;
    }
    setRegistration(payload.registration);
    event.currentTarget.reset();
    setCategoryId("");
    setSubcategoryId("");
    setProductId("");
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-16 w-44 sm:w-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image
                src="/logo/viraso-logo-cropped.png"
                alt="Viraso logo"
                width={220}
                height={75}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span className="font-viraso text-2xl font-black lowercase tracking-tight text-[#0d2946]" style={{ fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif' }}>viraso</span>
          </Link>
          <Link href="/warranty" className="rounded-full border border-[#0d2946] px-4 py-2 text-sm font-bold text-[#0d2946]">Warranty & Support</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Viraso</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Product Registration</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Register your Viraso product to keep your product information and purchase details on record.</p>
        </div>

        {registration ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0d2946]">Product Registered Successfully</p>
            <h2 className="mt-4 text-3xl font-black">Registration ID: {registration.registrationId}</h2>
            <div className="mt-8 grid gap-4 rounded-2xl bg-[#edf2f7] p-6 text-slate-700 sm:grid-cols-2">
              <p><strong className="text-[#111111]">Product:</strong> {registration.productName}</p>
              <p><strong className="text-[#111111]">Serial Number:</strong> {registration.serialNumber}</p>
              <p><strong className="text-[#111111]">Purchase Date:</strong> {registration.purchaseDate}</p>
              <p><strong className="text-[#111111]">Customer:</strong> {registration.customerName}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 print:hidden">
              <button type="button" onClick={() => window.print()} className="rounded-full bg-[#0d2946] px-5 py-3 text-sm font-bold text-white">Print / Save Registration</button>
              <button type="button" onClick={() => setRegistration(null)} className="rounded-full border border-[#0d2946] px-5 py-3 text-sm font-bold text-[#0d2946]">Register Another Product</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <label><span className={labelClass}>Serial Number *</span><input name="serialNumber" required className={fieldClass} /></label>
              <label><span className={labelClass}>Name *</span><input name="customerName" required className={fieldClass} /></label>
              <label><span className={labelClass}>Mobile Number *</span><input name="mobile" required inputMode="numeric" pattern="[0-9]{10}" className={fieldClass} /></label>
              <label><span className={labelClass}>Email Address</span><input name="email" type="email" className={fieldClass} /></label>
              <label><span className={labelClass}>PIN Code *</span><input name="pinCode" required inputMode="numeric" pattern="[0-9]{6}" className={fieldClass} /></label>
              <label><span className={labelClass}>City *</span><input name="city" required className={fieldClass} /></label>
              <label><span className={labelClass}>State *</span><input name="state" required className={fieldClass} /></label>
              <label><span className={labelClass}>Locality / Town *</span><input name="locality" required className={fieldClass} /></label>
              <label><span className={labelClass}>Purchase Date *</span><input name="purchaseDate" required type="date" className={fieldClass} /></label>
              <label><span className={labelClass}>Product Category *</span><select name="categoryId" required value={categoryId} onChange={(event) => handleCategoryChange(event.target.value)} className={fieldClass}><option value="">Select category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span className={labelClass}>Sub Category *</span><select name="subcategoryId" required value={subcategoryId} onChange={(event) => handleSubcategoryChange(event.target.value)} disabled={!categoryId} className={fieldClass}><option value="">Select sub-category</option>{visibleSubcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span className={labelClass}>Product *</span><select name="productId" required value={productId} onChange={(event) => setProductId(event.target.value)} disabled={!subcategoryId} className={fieldClass}><option value="">Select product</option>{visibleProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span className={labelClass}>Dealer / Seller Name *</span><input name="dealerName" required className={fieldClass} /></label>
              <label><span className={labelClass}>Dealer / Seller City *</span><input name="dealerCity" required className={fieldClass} /></label>
            </div>

            {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="mt-8 rounded-full bg-[#0d2946] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60">{isSubmitting ? "Registering..." : "REGISTER"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
