"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminTableShell } from "@/components/admin-table-shell";
import { AdminDeleteModal } from "@/components/admin-delete-modal";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  stock: string;
  publishStatus: "Published" | "Draft" | "Inactive";
  image: string;
  gallery?: string[];
  updatedAt?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success toast
  const [toast, setToast] = useState("");

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory = !selectedCategory || item.category === selectedCategory;

      const matchStatus =
        selectedStatus === "All" ||
        item.publishStatus === selectedStatus ||
        (selectedStatus === "Out of Stock" && item.stockQuantity <= 0);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, selectedCategory, selectedStatus]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/products?id=${encodeURIComponent(deleteTarget.id)}`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );
      if (res.ok) {
        setToast(`Product "${deleteTarget.name}" deactivated successfully.`);
        setTimeout(() => setToast(""), 4000);
        await loadProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filterPills = [
    { label: "All Products", active: selectedStatus === "All", onClick: () => setSelectedStatus("All"), count: products.length },
    { label: "Published", active: selectedStatus === "Published", onClick: () => setSelectedStatus("Published"), count: products.filter((p) => p.publishStatus === "Published").length },
    { label: "Drafts", active: selectedStatus === "Draft", onClick: () => setSelectedStatus("Draft"), count: products.filter((p) => p.publishStatus === "Draft").length },
    { label: "Inactive", active: selectedStatus === "Inactive", onClick: () => setSelectedStatus("Inactive"), count: products.filter((p) => p.publishStatus === "Inactive").length },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {toast && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-800 shadow-sm animate-in fade-in">
          <span>✓ {toast}</span>
          <button onClick={() => setToast("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      <AdminTableShell
        title="Products Catalog"
        description="Unified product management store syncing directly with the customer website."
        totalCount={products.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product name, SKU, or category..."
        filterPills={filterPills}
        isLoading={isLoading}
        isEmpty={filteredProducts.length === 0}
        emptyMessage="No products match your current filters."
        onResetFilters={() => {
          setSearch("");
          setSelectedCategory("");
          setSelectedStatus("All");
        }}
        actions={
          <>
            <button
              onClick={loadProducts}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ↻ Refresh
            </button>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0d2946] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#071d31] shadow-sm"
            >
              <span>+ Add New Product</span>
            </Link>
          </>
        }
        filters={
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-[#edf2f7] text-slate-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">Image</th>
                <th className="px-5 py-3.5 font-bold">Product Details</th>
                <th className="px-5 py-3.5 font-bold">Category</th>
                <th className="px-5 py-3.5 font-bold">Price</th>
                <th className="px-5 py-3.5 font-bold">Stock</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isOutOfStock = Number(product.stockQuantity || 0) <= 0;
                return (
                  <tr key={product.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                            No Img
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">SKU: {product.sku}</p>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">{product.category}</td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                      {product.mrp > product.price && (
                        <p className="text-xs text-slate-400 line-through">
                          ₹{Number(product.mrp).toLocaleString("en-IN")}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          isOutOfStock
                            ? "bg-red-50 text-red-700"
                            : product.stockQuantity <= 5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isOutOfStock
                              ? "bg-red-500"
                              : product.stockQuantity <= 5
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {product.stockQuantity} units
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          product.publishStatus === "Published"
                            ? "bg-blue-50 text-[#0d2946]"
                            : product.publishStatus === "Draft"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.publishStatus}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0d2946] transition hover:bg-slate-100"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminTableShell>

      {/* Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Deactivate Product"
        itemType="Product"
        itemName={deleteTarget?.name || ""}
        itemId={deleteTarget?.sku}
        consequences="This will change the product status to Inactive. It will no longer be visible or purchasable on the customer website, but all existing order history remains intact."
        confirmLabel="Deactivate Product"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
