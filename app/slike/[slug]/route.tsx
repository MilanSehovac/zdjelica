import { ImageResponse } from "next/og";
import { getProduct, listProducts } from "@/lib/products";
import { artSvgDocument } from "@/lib/art";
import { readImage } from "@/lib/uploads";

export function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

/** Slika proizvoda za društvene mreže i strukturirane podatke: učitana fotografija ili PNG ilustracija pakovanja. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return new Response("Not found", { status: 404 });

  if (product.image) {
    const img = readImage(product.image);
    if (img) {
      return new Response(new Uint8Array(img.data), {
        headers: { "Content-Type": img.type, "Cache-Control": "public, max-age=3600" },
      });
    }
  }

  const dataUri = `data:image/svg+xml;base64,${Buffer.from(artSvgDocument(product.pack, product.tone, product.pet)).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f8f6" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={630} height={630} alt="" />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
