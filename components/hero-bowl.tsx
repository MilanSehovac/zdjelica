/**
 * Zdjelica koja se puni granulama: jedina izražena animacija u cijelom shopu.
 * Radi samo CSS-om (transform i opacity), pa ne opterećuje stranicu,
 * a kod korisnika sa "reduce motion" granule su odmah na mjestu.
 */
const KIBBLES: { x: number; y: number; shape: "c" | "r"; rot: number; color: string }[] = [
  { x: 108, y: 166, shape: "c", rot: 0, color: "#c98a4b" },
  { x: 138, y: 168, shape: "r", rot: 20, color: "#a8672f" },
  { x: 168, y: 165, shape: "c", rot: 0, color: "#dfa660" },
  { x: 198, y: 169, shape: "r", rot: -15, color: "#c98a4b" },
  { x: 228, y: 166, shape: "c", rot: 0, color: "#a8672f" },
  { x: 258, y: 168, shape: "r", rot: 30, color: "#dfa660" },
  { x: 288, y: 166, shape: "c", rot: 0, color: "#c98a4b" },
  { x: 122, y: 146, shape: "r", rot: -25, color: "#dfa660" },
  { x: 153, y: 144, shape: "c", rot: 0, color: "#c98a4b" },
  { x: 184, y: 147, shape: "r", rot: 10, color: "#a8672f" },
  { x: 215, y: 144, shape: "c", rot: 0, color: "#dfa660" },
  { x: 246, y: 147, shape: "r", rot: -20, color: "#c98a4b" },
  { x: 276, y: 146, shape: "c", rot: 0, color: "#a8672f" },
  { x: 152, y: 124, shape: "c", rot: 0, color: "#a8672f" },
  { x: 183, y: 122, shape: "r", rot: 25, color: "#dfa660" },
  { x: 214, y: 124, shape: "c", rot: 0, color: "#c98a4b" },
  { x: 245, y: 123, shape: "r", rot: -10, color: "#a8672f" },
  { x: 198, y: 100, shape: "c", rot: 0, color: "#dfa660" },
];

export function HeroBowl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 360" className={className} role="img" aria-label="Zdjelica puna hrane za ljubimce">
      <ellipse cx="200" cy="338" rx="130" ry="12" fill="#124845" opacity="0.16" />
      <circle cx="200" cy="190" r="150" fill="#ffffff" opacity="0.55" />

      <g>
        {KIBBLES.map((k, i) => (
          <g key={i} className="kibble" style={{ "--i": i } as React.CSSProperties}>
            {k.shape === "c" ? (
              <circle cx={k.x} cy={k.y} r="15" fill={k.color} />
            ) : (
              <rect x={k.x - 15} y={k.y - 11} width="30" height="22" rx="9" fill={k.color} transform={`rotate(${k.rot} ${k.x} ${k.y})`} />
            )}
            <circle cx={k.x - 4} cy={k.y - 4} r="3" fill="#ffffff" opacity="0.28" />
          </g>
        ))}
      </g>

      <g className="bowl-wobble">
        <path d="M50 190H350C350 275 285 330 200 330C115 330 50 275 50 190Z" fill="#1b6460" />
        <rect x="36" y="174" width="328" height="28" rx="14" fill="#124845" />
        <g transform="translate(200 262)" fill="#f7c948">
          <ellipse cx="0" cy="12" rx="20" ry="16" />
          <ellipse cx="-27" cy="-8" rx="8" ry="11" transform="rotate(-18 -27 -8)" />
          <ellipse cx="-10" cy="-22" rx="8" ry="11" transform="rotate(-6 -10 -22)" />
          <ellipse cx="10" cy="-22" rx="8" ry="11" transform="rotate(6 10 -22)" />
          <ellipse cx="27" cy="-8" rx="8" ry="11" transform="rotate(18 27 -8)" />
        </g>
      </g>
    </svg>
  );
}
