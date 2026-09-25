"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const touchStartX = useRef<number | null>(null);

  const galleryImages = product.gallery ?? [product.image];
  const currentIndex = galleryImages.indexOf(selectedImage);
  const currentImage = selectedImage || product.image;
  const discountAmount = Math.max(product.mrp - product.price, 0);

  const goToImage = (index: number) => {
    const nextIndex = (index + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
  };

  const handleAddToCart = () => {
    if (typeof window === "undefined") return;

    const existing = JSON.parse(localStorage.getItem("viraso-cart") || "[]");
    const next = [...existing];
    const itemIndex = next.findIndex((item: any) => item.id === product.id);

    if (itemIndex >= 0) {
      next[itemIndex].quantity += quantity;
    } else {
      next.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    localStorage.setItem("viraso-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("viraso-cart-updated"));
    alert(`${product.name} added to cart.`);
  };

  const handleBuyNow = () => {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      "viraso-checkout",
      JSON.stringify([
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        },
      ])
    );

    window.location.href = "/checkout";
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div
              className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
              }}
              onTouchEnd={(event) => {
                if (touchStartX.current === null) return;
                const diff = touchStartX.current - event.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                  goToImage(currentIndex + (diff > 0 ? 1 : -1));
                }
                touchStartX.current = null;
              }}
            >
              <div className="relative aspect-[1/1] overflow-hidden rounded-[1.25rem] bg-slate-100">
                <Image src={currentImage} alt={product.name} width={1200} height={1200} className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={() => goToImage(currentIndex - 1)}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[#0d2946] shadow-md"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goToImage(currentIndex + 1)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[#0d2946] shadow-md"
                  aria-label="Next image"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-xl border p-1 ${currentImage === image ? "border-[#0d2946] bg-[#edf2f7]" : "border-slate-200 bg-white"}`}
                >
                  <div className="relative h-20 w-full overflow-hidden rounded-lg bg-slate-100">
                    <Image src={image} alt={product.name} width={200} height={200} className="h-full w-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0d2946]">{product.category}</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{product.shortDescription}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-black text-[#111111]">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-lg text-slate-400 line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
            </div>

            {discountAmount > 0 && (
              <p className="mt-2 text-sm font-semibold text-[#0d2946]">
                You Save: ₹{discountAmount.toLocaleString("en-IN")}
              </p>
            )}

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p><span className="font-bold text-[#111111]">Stock:</span> {product.stock}</p>
              <p><span className="font-bold text-[#111111]">SKU:</span> {product.sku}</p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <label className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">Qty</label>
              <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-11 w-11 text-xl font-bold text-[#0d2946]">−</button>
                <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-11 w-11 text-xl font-bold text-[#0d2946]">+</button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={handleBuyNow} className="inline-flex items-center justify-center rounded-full bg-[#0d2946] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]">BUY NOW</button>
              <button type="button" onClick={handleAddToCart} className="inline-flex items-center justify-center rounded-full border border-[#0d2946] bg-white px-5 py-3 text-sm font-bold text-[#0d2946] transition hover:bg-[#0d2946] hover:text-white">ADD TO CART</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="text-2xl font-black text-[#111111]">Product Description</h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-slate-700">
              <p>{product.description}</p>
            </div>

            {product.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-black text-[#111111]">Features</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <h3 className="text-2xl font-black text-[#111111]">Specifications</h3>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <tbody>
                  {product.specifications.map((spec) => (
                    <tr key={spec.label} className="border-b border-slate-200 last:border-b-0">
                      <th className="bg-slate-50 px-4 py-3 font-bold text-[#111111]">{spec.label}</th>
                      <td className="px-4 py-3 text-slate-700">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-700">
              {product.material && <p><span className="font-bold text-[#111111]">Material:</span> {product.material}</p>}
              {product.dimensions && <p><span className="font-bold text-[#111111]">Dimensions:</span> {product.dimensions}</p>}
              {product.weight && <p><span className="font-bold text-[#111111]">Weight:</span> {product.weight}</p>}
              {product.warranty && <p><span className="font-bold text-[#111111]">Warranty:</span> {product.warranty}</p>}
              {product.whatsIncluded && <p><span className="font-bold text-[#111111]">What’s Included:</span> {product.whatsIncluded}</p>}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
