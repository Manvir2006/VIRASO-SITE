"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ManagedProductFormValues {
  id?: string;
  name: string;
  sku: string;
  modelName: string;
  category: string;
  subCategory: string;
  mrp: number;
  price: number;
  discount: number;
  stockQuantity: number;
  publishStatus: "Published" | "Draft" | "Inactive";
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  dimensions: string;
  weight: string;
  material: string;
  colour: string;
  warranty: string;
  whatsIncluded: string;
  packageContents: string;
  shippingInformation: string;
}

interface AdminProductFormProps {
  initialData?: Partial<ManagedProductFormValues>;
  isEdit?: boolean;
}

export function AdminProductForm({ initialData, isEdit = false }: AdminProductFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ManagedProductFormValues>({
    id: initialData?.id || "",
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    modelName: initialData?.modelName || "",
    category: initialData?.category || "Sewing Machine Stands & Tables",
    subCategory: initialData?.subCategory || "Domestic",
    mrp: initialData?.mrp || 0,
    price: initialData?.price || 0,
    discount: initialData?.discount || 0,
    stockQuantity: initialData?.stockQuantity ?? 10,
    publishStatus: initialData?.publishStatus || "Published",
    image: initialData?.image || "",
    gallery: initialData?.gallery || (initialData?.image ? [initialData.image] : []),
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    features: initialData?.features || [],
    specifications: initialData?.specifications || [
      { label: "Material", value: "Cast Iron & High Grade Wood" },
      { label: "Warranty", value: "1 Year Brand Warranty" },
    ],
    dimensions: initialData?.dimensions || "",
    weight: initialData?.weight || "",
    material: initialData?.material || "",
    colour: initialData?.colour || "Black",
    warranty: initialData?.warranty || "1 Year Brand Warranty",
    whatsIncluded: initialData?.whatsIncluded || "",
    packageContents: initialData?.packageContents || "",
    shippingInformation: initialData?.shippingInformation || "Free delivery within 3-5 business days.",
  });

  const [featuresText, setFeaturesText] = useState(
    (initialData?.features || []).join("\n")
  );

  const [specsText, setSpecsText] = useState(
    (initialData?.specifications || [])
      .map((s) => `${s.label}: ${s.value}`)
      .join("\n")
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const handleChange = (field: keyof ManagedProductFormValues, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "mrp" || field === "price") {
        const mrp = field === "mrp" ? Number(value) : prev.mrp;
        const price = field === "price" ? Number(value) : prev.price;
        next.discount = Math.max(0, mrp - price);
      }
      return next;
    });
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => uploadFormData.append("images", file));

      const res = await fetch("/api/admin/products/images", {
        method: "POST",
        headers: { "x-admin-key": key() },
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image(s).");

      const uploadedUrls: string[] = data.urls || [];
      setFormData((prev) => {
        const newGallery = [...prev.gallery, ...uploadedUrls];
        const newPrimary = prev.image || newGallery[0] || "";
        return { ...prev, gallery: newGallery, image: newPrimary };
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload images.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Set primary image
  const handleSetPrimary = (imgUrl: string) => {
    setFormData((prev) => ({ ...prev, image: imgUrl }));
  };

  // Delete image from gallery
  const handleDeleteImage = (imgUrl: string) => {
    setFormData((prev) => {
      const newGallery = prev.gallery.filter((url) => url !== imgUrl);
      let newPrimary = prev.image;
      if (prev.image === imgUrl) {
        newPrimary = newGallery[0] || "";
      }
      return { ...prev, gallery: newGallery, image: newPrimary };
    });
  };

  // Reorder images
  const handleMoveImage = (index: number, direction: "left" | "right") => {
    setFormData((prev) => {
      const newGallery = [...prev.gallery];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newGallery.length) return prev;

      const temp = newGallery[index];
      newGallery[index] = newGallery[targetIndex];
      newGallery[targetIndex] = temp;

      return { ...prev, gallery: newGallery };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      // Parse features
      const features = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      // Parse specifications
      const specifications = specsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const colonIndex = line.indexOf(":");
          if (colonIndex > 0) {
            return {
              label: line.slice(0, colonIndex).trim(),
              value: line.slice(colonIndex + 1).trim(),
            };
          }
          return { label: "Detail", value: line };
        });

      const payload = {
        ...formData,
        features,
        specifications,
        image: formData.image || formData.gallery[0] || "",
      };

      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      setSuccess(
        isEdit
          ? "Product updated successfully. Customer storefront is updated."
          : "Product created successfully."
      );

      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d2946] hover:underline"
          >
            ← Back to All Products
          </Link>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {isEdit ? `Edit Product: ${formData.name || formData.sku}` : "Add New Product"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Products saved here immediately update the customer catalog and stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#0d2946] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
          >
            {isSaving ? "Saving Product..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          ✕ {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          ✓ {success}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Main Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Basic Information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Viraso Domestic Sewing Machine Stand & Table"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  SKU / Product ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="e.g. VIR-DOM-01"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => handleChange("modelName", e.target.value)}
                  placeholder="e.g. Domestic Regular"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g. Sewing Machine Stands & Tables"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Sub-Category
                </label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => handleChange("subCategory", e.target.value)}
                  placeholder="e.g. Domestic"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Pricing & Inventory</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.mrp}
                  onChange={(e) => handleChange("mrp", Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.price}
                  onChange={(e) => handleChange("price", Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.discount}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Current Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.stockQuantity}
                  onChange={(e) => handleChange("stockQuantity", Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none sm:w-1/2"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Setting this to 0 will automatically display &quot;Out of Stock&quot; to customers.
                </p>
              </div>
            </div>
          </div>

          {/* Gallery & Image Management */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Multi-Image Gallery Manager</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Upload multiple photos, set the primary thumbnail, reorder images, or remove obsolete photos.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0d2946] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#071d31]">
                <span>+ Upload Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {isUploading && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#0d2946]">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading image files...
              </div>
            )}

            {formData.gallery.length === 0 ? (
              <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-bold text-slate-600">No images uploaded yet.</p>
                <p className="mt-1 text-xs text-slate-400">
                  Click the Upload button above to add product images.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {formData.gallery.map((url, idx) => {
                  const isPrimary = formData.image === url;
                  return (
                    <div
                      key={url}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-2 shadow-sm transition ${
                        isPrimary ? "border-[#0d2946] ring-2 ring-[#0d2946]" : "border-slate-200"
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                        <Image src={url} alt={`Gallery item ${idx + 1}`} fill className="object-cover" />
                        {isPrimary && (
                          <span className="absolute left-2 top-2 rounded-md bg-[#0d2946] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            ★ Primary
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="mt-2 flex items-center justify-between gap-1 pt-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, "left")}
                            className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                            title="Move left"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            disabled={idx === formData.gallery.length - 1}
                            onClick={() => handleMoveImage(idx, "right")}
                            className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                            title="Move right"
                          >
                            ▶
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(url)}
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#0d2946] hover:bg-blue-50"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(url)}
                            className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-red-600 hover:bg-red-50"
                            title="Delete image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Descriptions & Specifications */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Descriptions & Features</h2>
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => handleChange("shortDescription", e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  placeholder="Concise overview for product cards and search results"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  placeholder="Detailed product information..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Features (One feature per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  placeholder="Heavy-duty cast iron stand&#10;Smooth pedal action&#10;Includes leather belt"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Specifications (Label: Value per line)
                </label>
                <textarea
                  rows={4}
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  placeholder="Material: Heavy Duty Cast Iron&#10;Warranty: 1 Year Brand Warranty&#10;Table Top: Premium Waterproof Ply"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Status & Metadata */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Publish Status</h3>
            <div className="mt-4 space-y-3">
              {(["Published", "Draft", "Inactive"] as const).map((st) => (
                <label
                  key={st}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                    formData.publishStatus === st
                      ? "border-[#0d2946] bg-blue-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{st}</p>
                    <p className="text-xs text-slate-500">
                      {st === "Published"
                        ? "Visible & purchasable on website"
                        : st === "Draft"
                        ? "Hidden from public catalog"
                        : "Archived / not active"}
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={formData.publishStatus === st}
                    onChange={() => handleChange("publishStatus", st)}
                    className="h-4 w-4 accent-[#0d2946]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Physical Attributes & Warranty */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Attributes & Shipping</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Warranty Period
                </label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => handleChange("warranty", e.target.value)}
                  placeholder="e.g. 1 Year Brand Warranty"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleChange("dimensions", e.target.value)}
                  placeholder="e.g. 36 x 18 x 30 inches"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="e.g. 18.5 kg"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Colour
                </label>
                <input
                  type="text"
                  value={formData.colour}
                  onChange={(e) => handleChange("colour", e.target.value)}
                  placeholder="e.g. Black & Natural Wood"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Package Contents
                </label>
                <input
                  type="text"
                  value={formData.packageContents}
                  onChange={(e) => handleChange("packageContents", e.target.value)}
                  placeholder="e.g. Stand, Table Top, Belt, Drawer"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Shipping Info
                </label>
                <input
                  type="text"
                  value={formData.shippingInformation}
                  onChange={(e) => handleChange("shippingInformation", e.target.value)}
                  placeholder="e.g. Dispatched in 24 hours"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-full bg-[#0d2946] py-3.5 text-sm font-bold text-white transition hover:bg-[#071d31] disabled:opacity-60 shadow-md"
            >
              {isSaving ? "Saving..." : isEdit ? "Save Product Changes" : "Publish Product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
