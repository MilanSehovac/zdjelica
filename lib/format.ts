/** Datum i vrijeme u sarajevskoj vremenskoj zoni, npr. "13.10.2026. u 15:31". */
export function formatDateTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}. u ${get("hour")}:${get("minute")}`;
}

export function formatDate(iso: string): string {
  return formatDateTime(iso).split(" u ")[0];
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
