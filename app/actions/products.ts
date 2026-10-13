"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { createProduct, deleteProduct, getProductAny, setProductActive, updateProduct } from "@/lib/products";
import { parseProductForm } from "@/lib/product-form";
import { UploadError, deleteImage, saveImage } from "@/lib/uploads";
import { pickValues, type FormState } from "@/lib/form-state";

const KEEP = ["name", "pet", "category", "pack", "tone", "short", "description", "highlights", "intervalWeeks"];

async function guard(): Promise<boolean> {
  return isAdmin(await getCurrentUser());
}

/** Javne stranice su statične, pa se nakon svake izmjene kataloga osvježavaju. */
function refreshShop() {
  revalidatePath("/", "layout");
}

async function readImage(fd: FormData): Promise<{ name: string | null } | { error: string }> {
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) return { name: null };
  try {
    return { name: saveImage(Buffer.from(await file.arrayBuffer())) };
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    throw err;
  }
}

function formValues(fd: FormData): Record<string, string> {
  const values = pickValues(fd, KEEP);
  if (fd.get("featured") === "on") values.featured = "on";
  if (fd.get("active") === "on") values.active = "on";
  return values;
}

export async function createProductAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await guard())) return { message: "Nemate pristup." };
  const values = formValues(fd);

  const parsed = parseProductForm(fd);
  const img = await readImage(fd);
  const errors = parsed.ok ? {} : { ...parsed.errors };
  if ("error" in img) errors.image = img.error;
  if (!parsed.ok || "error" in img) {
    if ("name" in img && img.name) deleteImage(img.name);
    return { values, errors, message: "Provjerite označena polja. Ako ste birali fotografiju, odaberite je ponovo." };
  }

  const product = createProduct(parsed.data, img.name);
  refreshShop();
  redirect(`/admin/proizvodi?sacuvano=${encodeURIComponent(product.slug)}`);
}

export async function updateProductAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await guard())) return { message: "Nemate pristup." };
  const slug = String(fd.get("slug") ?? "");
  const current = getProductAny(slug);
  if (!current) return { message: "Proizvod više ne postoji." };
  const values = formValues(fd);

  const parsed = parseProductForm(fd);
  const img = await readImage(fd);
  const errors = parsed.ok ? {} : { ...parsed.errors };
  if ("error" in img) errors.image = img.error;
  if (!parsed.ok || "error" in img) {
    if ("name" in img && img.name) deleteImage(img.name);
    return { values, errors, message: "Provjerite označena polja. Ako ste birali fotografiju, odaberite je ponovo." };
  }

  let image: string | null | undefined;
  if (img.name) image = img.name;
  else if (fd.get("removeImage") === "on") image = null;

  updateProduct(slug, parsed.data, image);
  if (image !== undefined && current.image && current.image !== image) deleteImage(current.image);
  refreshShop();
  redirect(`/admin/proizvodi?sacuvano=${encodeURIComponent(slug)}`);
}

export async function deleteProductAction(fd: FormData) {
  if (!(await guard())) return;
  const slug = String(fd.get("slug") ?? "");
  const removed = deleteProduct(slug);
  if (removed) deleteImage(removed.image);
  refreshShop();
  redirect("/admin/proizvodi?obrisano=1");
}

export async function toggleProductActiveAction(fd: FormData) {
  if (!(await guard())) return;
  const slug = String(fd.get("slug") ?? "");
  const current = getProductAny(slug);
  if (!current) return;
  setProductActive(slug, !current.active);
  refreshShop();
  revalidatePath("/admin/proizvodi");
}
