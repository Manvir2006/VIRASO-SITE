import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default function AddProductPage() {
  return (
    <main className="mx-auto max-w-6xl">
      <AdminProductForm isEdit={false} />
    </main>
  );
}
