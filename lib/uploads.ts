import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { dbPath } from "./db";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_NAME = /^[a-f0-9]{24}\.(jpg|png|webp)$/;

export const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Fotografije se čuvaju pored baze (isti trajni disk), u podfolderu `uploads`. */
export function uploadsDir(): string {
  const file = dbPath();
  const base = file === ":memory:" ? path.join(os.tmpdir(), "zdjelica-test") : path.dirname(file);
  return path.join(base, "uploads");
}

/** Tip određujemo po sadržaju fajla, ne po nastavku koji šalje korisnik. */
export function detectImageExt(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

export class UploadError extends Error {}

/** Snima fotografiju i vraća ime fajla. */
export function saveImage(data: Buffer): string {
  if (data.length === 0) throw new UploadError("Fajl je prazan.");
  if (data.length > MAX_IMAGE_BYTES) throw new UploadError("Fotografija je prevelika (najviše 5 MB).");
  const ext = detectImageExt(data);
  if (!ext) throw new UploadError("Dozvoljeni su samo JPG, PNG i WebP.");
  const dir = uploadsDir();
  fs.mkdirSync(dir, { recursive: true });
  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(dir, name), data);
  return name;
}

export function deleteImage(name: string | null | undefined) {
  if (!name || !IMAGE_NAME.test(name)) return;
  try {
    fs.unlinkSync(path.join(uploadsDir(), name));
  } catch {
    /* već obrisano */
  }
}

export function readImage(name: string): { data: Buffer; type: string } | null {
  if (!IMAGE_NAME.test(name)) return null;
  try {
    const data = fs.readFileSync(path.join(uploadsDir(), name));
    return { data, type: IMAGE_TYPES[name.split(".")[1]] };
  } catch {
    return null;
  }
}
