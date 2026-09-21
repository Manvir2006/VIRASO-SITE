import { notFound } from "next/navigation";
import { getManagedProductById } from "@/lib/product-store";
import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const product = await getManagedProductById(decodedId);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl">
      <AdminProductForm
        isEdit={true}
        initialData={{
          ...product,
          gallery: product.gallery && product.gallery.length ? product.gallery : (product.image ? [product.image] : []),
        }}
      />
    </main>
  );
}
