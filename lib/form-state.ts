export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Vraćamo unesene vrijednosti (bez lozinki) da forma ne izgubi unos nakon greške. */
  values?: Record<string, string>;
};

export function pickValues(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
