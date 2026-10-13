import type { PackShape, Pet } from "@/lib/catalog";
import { artInnerSvg } from "@/lib/art";

/**
 * Prikaz proizvoda: fotografija koju je admin učitao, a ako je nema, SVG
 * ilustracija pakovanja (nema učitavanja i nema pomjeranja rasporeda).
 * `priority` se koristi za glavnu sliku iznad pregiba (LCP).
 */
export function ProductArt({
  pack,
  tone,
  pet,
  image,
  title,
  className,
  priority = false,
}: {
  pack: PackShape;
  tone: 0 | 1 | 2 | 3;
  pet: Pet;
  image?: string | null;
  title?: string;
  className?: string;
  priority?: boolean;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/media/${image}`}
        alt={title ?? ""}
        width={800}
        height={800}
        className={`${className ?? ""} bg-mint object-cover`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    );
  }
  const a11y = title ? ({ role: "img", "aria-label": title } as const) : ({ "aria-hidden": true } as const);
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      {...a11y}
      dangerouslySetInnerHTML={{ __html: artInnerSvg(pack, tone, pet) }}
    />
  );
}
