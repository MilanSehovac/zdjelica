import { CartView } from "@/components/cart-view";
import { buildSkuIndex } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Korpa",
  description: "Pregled artikala u korpi.",
  path: "/korpa",
  noindex: true,
});

export default function CartPage() {
  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Korpa</h1>
      <CartView skuIndex={buildSkuIndex()} shipping={{ flatCents: site.shipping.flatCents, freeOverCents: site.shipping.freeOverCents }} />
    </div>
  );
}
