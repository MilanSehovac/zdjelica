import { readImage } from "@/lib/uploads";

/** Servira fotografije proizvoda koje je admin učitao. Ime fajla je nasumično, pa je keš trajan. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const img = readImage(file);
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.type,
      "Content-Length": String(img.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
