import type { Metadata } from "next";
import ProductsClient from "./products-client";

export const metadata: Metadata = {
  title: "Products | Viraso",
  description: "Browse Viraso sewing machine stands and machinery products for home and professional use.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
