"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("viraso-cart") || "[]");
    setItems(saved);
  }, []);

  const updateItem = (id: string, nextQuantity: number) => {
    const updated = items
      .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, nextQuantity) } : item))
      .filter((item) => item.quantity > 0);

    setItems(updated);
    localStorage.setItem("viraso-cart", JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem("viraso-cart", JSON.stringify(updated));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Shopping Cart</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg text-slate-600">Your cart is empty.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-[1rem] bg-slate-100">
                    <Image src={item.image} alt={item.name} width={300} height={300} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#111111]">{item.name}</h2>
                    <p className="mt-2 text-lg font-black text-[#111111]">₹{item.price.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                      <button type="button" onClick={() => updateItem(item.id, item.quantity - 1)} className="h-10 w-10 font-bold text-[#0d2946]">−</button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => updateItem(item.id, item.quantity + 1)} className="h-10 w-10 font-bold text-[#0d2946]">+</button>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-bold text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Cart Summary</h2>
              <div className="mt-6 space-y-4 text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#111111]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-[#111111]">₹0</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-black text-[#111111]">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link href="/checkout" className="mt-8 inline-flex w-full justify-center rounded-full bg-[#0d2946] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]">
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
