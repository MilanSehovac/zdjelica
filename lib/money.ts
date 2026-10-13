/** Cijene se čuvaju u feninzima (1 KM = 100 feninga) da izbjegnemo greške zaokruživanja. */
export function formatKM(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped},${frac} KM`;
}

/** Broj sa dvije decimale za strukturirane podatke (JSON-LD). */
export function toDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}
