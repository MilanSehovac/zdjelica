import { CheckoutForm } from "@/components/checkout-form";
import { buildSkuIndex } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Plaćanje",
  description: "Unesite podatke za dostavu i potvrdite narudžbu.",
  path: "/placanje",
  noindex: true,
});

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-[clamp(1.9rem,3vw+0.6rem,2.8rem)]">Plaćanje</h1>
      <CheckoutForm
        skuIndex={buildSkuIndex()}
        shipping={{ flatCents: site.shipping.flatCents, freeOverCents: site.shipping.freeOverCents }}
        prefill={{ name: user?.name ?? "", email: user?.email ?? "" }}
      />
    </div>
  );
}
