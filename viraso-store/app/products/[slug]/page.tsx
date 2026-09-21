import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";
import { getManagedProductBySlug } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getManagedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
