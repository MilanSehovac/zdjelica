import Link from "next/link";
import { minPrice, productUrl, type Product } from "@/lib/catalog";
import { formatKM } from "@/lib/money";
import { ProductArt } from "./product-art";
import { HeartButton } from "./heart-button";

export function ProductCard({ product, as: Heading = "h3" }: { product: Product; as?: "h2" | "h3" }) {
  const multiple = product.variants.length > 1;
  return (
    <article className="card relative flex flex-col overflow-hidden transition-colors hover:border-teal">
      <div className="relative">
        <ProductArt pack={product.pack} tone={product.tone} pet={product.pet} image={product.image} className="aspect-square w-full" />
        <HeartButton slug={product.slug} name={product.name} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Heading className="text-[1.08rem] leading-snug">
          <Link href={productUrl(product)} className="text-ink no-underline after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </Heading>
        <p className="line-clamp-2 text-[0.95rem] text-ink-soft">{product.short}</p>
        <p className="mt-auto pt-2 font-bold">
          {multiple ? "od " : ""}
          {formatKM(minPrice(product))}
        </p>
      </div>
    </article>
  );
}
