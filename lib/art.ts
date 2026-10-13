import type { PackShape, Pet } from "./catalog";

const TONES = [
  { bg: "#d6ebe4", main: "#1b6460", dark: "#124845", accent: "#f7c948" },
  { bg: "#fdeec0", main: "#b8481a", dark: "#8a3410", accent: "#fff4d6" },
  { bg: "#dfe7f5", main: "#2d4a8a", dark: "#1f3466", accent: "#f7c948" },
  { bg: "#ffe3df", main: "#8c2f4b", dark: "#66203a", accent: "#fff1ef" },
] as const;

function petGlyph(pet: Pet, cx: number, cy: number, s: number, fill: string, ink: string): string {
  const n = (v: number) => Math.round(v * 100) / 100;
  const ears =
    pet === "pas"
      ? `<ellipse cx="${n(cx - s * 0.95)}" cy="${n(cy - s * 0.1)}" rx="${n(s * 0.38)}" ry="${n(s * 0.75)}" fill="${ink}" transform="rotate(14 ${n(cx - s * 0.95)} ${n(cy - s * 0.1)})"/>` +
        `<ellipse cx="${n(cx + s * 0.95)}" cy="${n(cy - s * 0.1)}" rx="${n(s * 0.38)}" ry="${n(s * 0.75)}" fill="${ink}" transform="rotate(-14 ${n(cx + s * 0.95)} ${n(cy - s * 0.1)})"/>`
      : `<polygon points="${n(cx - s * 0.98)},${n(cy - s * 0.1)} ${n(cx - s * 0.72)},${n(cy - s * 1.3)} ${n(cx - s * 0.05)},${n(cy - s * 0.85)}" fill="${ink}"/>` +
        `<polygon points="${n(cx + s * 0.98)},${n(cy - s * 0.1)} ${n(cx + s * 0.72)},${n(cy - s * 1.3)} ${n(cx + s * 0.05)},${n(cy - s * 0.85)}" fill="${ink}"/>`;
  return (
    ears +
    `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${fill}" stroke="${ink}" stroke-width="${n(s * 0.12)}"/>` +
    `<circle cx="${n(cx - s * 0.36)}" cy="${n(cy - s * 0.1)}" r="${n(s * 0.1)}" fill="${ink}"/>` +
    `<circle cx="${n(cx + s * 0.36)}" cy="${n(cy - s * 0.1)}" r="${n(s * 0.1)}" fill="${ink}"/>` +
    `<ellipse cx="${cx}" cy="${n(cy + s * 0.22)}" rx="${n(s * 0.17)}" ry="${n(s * 0.12)}" fill="${ink}"/>`
  );
}

const cache = new Map<string, string>();

/** Unutrašnjost SVG-a (viewBox 0 0 200 200) za ilustraciju pakovanja. */
export function artInnerSvg(pack: PackShape, tone: 0 | 1 | 2 | 3, pet: Pet): string {
  const key = `${pack}:${tone}:${pet}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const c = TONES[tone];
  let body = "";

  switch (pack) {
    case "bag":
      body =
        `<rect x="56" y="48" width="88" height="126" rx="10" fill="${c.main}"/>` +
        `<rect x="56" y="38" width="88" height="16" rx="3" fill="${c.dark}"/>` +
        `<path d="M64 41v10M72 41v10M80 41v10M88 41v10M96 41v10M104 41v10M112 41v10M120 41v10M128 41v10M136 41v10" stroke="${c.main}" stroke-width="2" opacity="0.55"/>` +
        `<path d="M56 150H144V164a10 10 0 0 1-10 10H66a10 10 0 0 1-10-10Z" fill="${c.dark}"/>` +
        `<circle cx="100" cy="106" r="34" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 108, 16, "#ffffff", c.dark);
      break;
    case "can":
      body =
        `<rect x="64" y="66" width="72" height="98" rx="6" fill="${c.main}"/>` +
        `<ellipse cx="100" cy="66" rx="36" ry="9" fill="#dfe6e4" stroke="${c.dark}" stroke-width="2"/>` +
        `<ellipse cx="100" cy="164" rx="36" ry="8" fill="${c.dark}"/>` +
        `<rect x="64" y="94" width="72" height="48" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 118, 14, "#ffffff", c.dark);
      break;
    case "pouch":
      body =
        `<path d="M62 52H138Q144 52 144 58V160Q144 170 134 170H66Q56 170 56 160V58Q56 52 62 52Z" fill="${c.main}"/>` +
        `<rect x="56" y="52" width="88" height="13" rx="4" fill="${c.dark}"/>` +
        `<circle cx="100" cy="58.5" r="3" fill="${c.bg}"/>` +
        `<rect x="70" y="82" width="60" height="64" rx="16" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 114, 15, "#ffffff", c.dark);
      break;
    case "box":
      body =
        `<rect x="54" y="70" width="92" height="98" rx="6" fill="${c.main}"/>` +
        `<rect x="50" y="56" width="100" height="20" rx="5" fill="${c.dark}"/>` +
        `<circle cx="100" cy="120" r="29" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 122, 14, "#ffffff", c.dark);
      break;
    case "bottle":
      body =
        `<rect x="88" y="30" width="24" height="24" rx="4" fill="${c.dark}"/>` +
        `<path d="M78 60H122Q138 64 138 84V158Q138 172 126 172H74Q62 172 62 158V84Q62 64 78 60Z" fill="${c.main}"/>` +
        `<rect x="70" y="94" width="60" height="56" rx="12" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 122, 14, "#ffffff", c.dark);
      break;
    case "tube":
      body =
        `<g transform="rotate(-18 100 100)">` +
        `<rect x="76" y="38" width="48" height="116" rx="10" fill="${c.main}"/>` +
        `<rect x="76" y="146" width="48" height="14" rx="3" fill="${c.dark}"/>` +
        `<rect x="84" y="22" width="32" height="20" rx="5" fill="${c.dark}"/>` +
        `<circle cx="100" cy="96" r="21" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 98, 10, "#ffffff", c.dark) +
        `</g>`;
      break;
    case "tub":
      body =
        `<path d="M56 74H144L136 166Q135 174 127 174H73Q65 174 64 166Z" fill="${c.main}"/>` +
        `<path d="M70 62Q100 26 130 62" fill="none" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>` +
        `<rect x="50" y="60" width="100" height="18" rx="6" fill="${c.dark}"/>` +
        `<circle cx="100" cy="124" r="28" fill="${c.accent}"/>` +
        petGlyph(pet, 100, 126, 13, "#ffffff", c.dark);
      break;
  }

  const svg =
    `<rect width="200" height="200" fill="${c.bg}"/>` +
    `<ellipse cx="100" cy="182" rx="56" ry="7" fill="${c.dark}" opacity="0.14"/>` +
    body;
  cache.set(key, svg);
  return svg;
}

/** Potpuni SVG dokument (za generisanje PNG slika proizvoda). */
export function artSvgDocument(pack: PackShape, tone: 0 | 1 | 2 | 3, pet: Pet): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="600" height="600">${artInnerSvg(pack, tone, pet)}</svg>`;
}
