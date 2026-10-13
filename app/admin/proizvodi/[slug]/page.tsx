import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductAny } from "@/lib/products";
import { productUrl } from "@/lib/catalog";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Uredi proizvod (admin)", robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const product = getProductAny(slug);
  if (!product) notFound();
  return (
    <div className="container-page max-w-3xl py-10">
      <p className="mb-2"><Link href="/admin/proizvodi">← Svi proizvodi</Link></p>
      <h1 className="text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Uredi proizvod</h1>
      <p className="mb-8 mt-2 text-ink-soft">
        Adresa: <code>{productUrl(product)}</code> (ne mijenja se, zbog pretrage){" "}
        {product.active ? <Link href={productUrl(product)}>Pogledaj u shopu</Link> : "· trenutno sakriven"}
      </p>
      <ProductForm product={product} />
    </div>
  );
}
