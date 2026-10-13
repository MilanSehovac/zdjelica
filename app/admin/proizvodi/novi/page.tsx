import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Novi proizvod (admin)", robots: { index: false, follow: false } };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="container-page max-w-3xl py-10">
      <p className="mb-2"><Link href="/admin/proizvodi">← Svi proizvodi</Link></p>
      <h1 className="mb-8 text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Novi proizvod</h1>
      <ProductForm />
    </div>
  );
}
