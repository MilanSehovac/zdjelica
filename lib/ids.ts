import crypto from "node:crypto";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // bez zbunjujućih znakova (i, l, o, 0, 1)

/** Nepogodiv javni identifikator narudžbe (koristi se u linku za potvrdu). */
export function publicOrderId(length = 14): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function orderNumber(id: number): string {
  return `ZD-${String(id).padStart(5, "0")}`;
}
