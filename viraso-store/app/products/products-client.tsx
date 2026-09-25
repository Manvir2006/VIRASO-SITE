"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type CatalogProduct = (typeof products)[number];

const handleAddToCart = (product: (typeof products)[number]) => {
  if (typeof window === "undefined") return;

  const existing = JSON.parse(localStorage.getItem("viraso-cart") || "[]");
  const next = [...existing];
  const itemIndex = next.findIndex((item: any) => item.id === product.id);

  if (itemIndex >= 0) {
    next[itemIndex].quantity += 1;
  } else {
    next.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    });
  }

  localStorage.setItem("viraso-cart", JSON.stringify(next));
  window.dispatchEvent(new Event("viraso-cart-updated"));
};

export default function ProductsClient() {
  const [catalog, setCatalog] = useState<CatalogProduct[]>(products);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCatalog(data.products || products))
      .catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Our Products</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#111111] sm:text-5xl">Products</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {catalog.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <Image src={product.image} alt={product.name} width={600} height={600} className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-[#0d2946] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{product.stock}</span>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#0d2946]">{product.id}</p>
                  <h2 className="mt-2 text-lg font-bold text-[#111111]">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-[#111111]">₹{product.price.toLocaleString("en-IN")}</span>
                  <span className="text-sm text-slate-400 line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
                </div>

                <div className="space-y-2">
                  <Link href={`/products/${product.slug}`} className="block rounded-full border border-[#0d2946] bg-white px-4 py-2 text-center text-sm font-bold text-[#0d2946] transition hover:bg-[#0d2946] hover:text-white">
                    View Product
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => handleAddToCart(product)} className="rounded-full border border-[#0d2946] bg-white px-3 py-2 text-xs font-bold text-[#0d2946] transition hover:bg-[#0d2946] hover:text-white">
                      Add to Cart
                    </button>
                    <Link href={`/checkout?product=${product.slug}`} className="rounded-full bg-[#0d2946] px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-[#071d31]">
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
