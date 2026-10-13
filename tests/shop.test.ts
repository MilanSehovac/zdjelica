import "./setup";
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createUser, authenticate, EmailTakenError, createSession, getUserBySessionToken, deleteSession } from "../lib/auth";
import { toggleFavorite, setRegular, listFavorites } from "../lib/favorites";
import { priceCart, computeTotals, createOrder, listOrdersForUser, updateOrderStatus, getOrderByPublicId, CartError, type CustomerInput } from "../lib/orders";
import { sendDueReminders } from "../lib/reminders";
import { getDb } from "../lib/db";
import { checkoutSchema, registerSchema, fieldErrors } from "../lib/validation";
import { subscribe } from "../lib/newsletter";
import { rateLimit, resetRateLimits } from "../lib/ratelimit";
import { formatKM } from "../lib/money";
import { makeSku, LANDING, CATEGORIES, PETS } from "../lib/catalog";
import {
  listProducts, getProduct, getProducts, parseSku, buildSkuIndex, createProduct, updateProduct, deleteProduct,
  setProductActive, getProductAny, slugify, type ProductInput,
} from "../lib/products";
import { parseProductForm, parsePriceKM } from "../lib/product-form";
import { detectImageExt, saveImage, readImage, deleteImage, UploadError } from "../lib/uploads";
import { upsertAdmin } from "../lib/auth";
import { isAdmin } from "../lib/session";

const products = listProducts();

const customer: CustomerInput = {
  name: "Test Kupac",
  email: "kupac@example.com",
  phone: "+387 61 123 456",
  address: "Zmaja od Bosne 1",
  city: "Sarajevo",
  postalCode: "71000",
  note: "",
  paymentMethod: "pouzece",
};

describe("katalog", () => {
  test("slugovi i SKU su jedinstveni, cijene su pozitivni cijeli brojevi", () => {
    const slugs = new Set(products.map((p) => p.slug));
    assert.equal(slugs.size, products.length);
    const skus = new Set<string>();
    for (const p of products) {
      assert.ok(p.variants.length > 0);
      for (const v of p.variants) {
        assert.ok(Number.isInteger(v.priceCents) && v.priceCents > 0, `${p.slug} ${v.id}`);
        const sku = makeSku(p.slug, v.id);
        assert.ok(!skus.has(sku));
        skus.add(sku);
        assert.equal(parseSku(sku)?.variant.id, v.id);
      }
    }
  });

  test("svaka kombinacija ljubimac + kategorija ima proizvode i SEO tekst", () => {
    for (const pet of Object.keys(PETS) as (keyof typeof PETS)[]) {
      for (const cat of Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]) {
        assert.ok(getProducts({ pet, category: cat }).length > 0, `${pet}/${cat}`);
        assert.ok(LANDING[pet].categories[cat].description.length > 40);
      }
    }
  });

  test("formatiranje cijene", () => {
    assert.equal(formatKM(1490), "14,90 KM");
    assert.equal(formatKM(500), "5,00 KM");
    assert.equal(formatKM(123456), "1.234,56 KM");
  });
});

describe("korpa i cijene", () => {
  const sku = makeSku(products[0].slug, products[0].variants[0].id);

  test("odbija praznu korpu, nepoznat SKU i neispravnu količinu", () => {
    assert.throws(() => priceCart([]), CartError);
    assert.throws(() => priceCart([{ sku: "nema:1", quantity: 1 }]), CartError);
    assert.throws(() => priceCart([{ sku, quantity: 0 }]), CartError);
    assert.throws(() => priceCart([{ sku, quantity: -3 }]), CartError);
  });

  test("spaja duplikate i ograničava količinu", () => {
    const lines = priceCart([{ sku, quantity: 2 }, { sku, quantity: 3 }]);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].quantity, 5);
    assert.equal(priceCart([{ sku, quantity: 999 }])[0].quantity, 20);
  });

  test("cijena dolazi iz kataloga", () => {
    const [line] = priceCart([{ sku, quantity: 2 }]);
    assert.equal(line.unitPriceCents, products[0].variants[0].priceCents);
    assert.equal(line.lineTotalCents, line.unitPriceCents * 2);
  });

  test("dostava: plaća se ispod praga, besplatna iznad", () => {
    assert.equal(computeTotals([{ lineTotalCents: 1000 }]).shippingCents, 600);
    assert.equal(computeTotals([{ lineTotalCents: 7000 }]).shippingCents, 0);
    assert.equal(computeTotals([{ lineTotalCents: 6999 }]).totalCents, 6999 + 600);
  });
});

describe("korisnici i sesije", () => {
  test("registracija, duplikat, prijava i sesija", () => {
    const user = createUser({ email: "Ana@Example.com", name: "Ana", password: "tajna-lozinka-1" });
    assert.equal(user.email, "ana@example.com");
    assert.throws(() => createUser({ email: "ana@example.com", name: "Ana 2", password: "druga-lozinka-2" }), EmailTakenError);

    assert.equal(authenticate("ana@example.com", "pogresna"), null);
    assert.equal(authenticate("nepoznat@example.com", "tajna-lozinka-1"), null);
    assert.equal(authenticate("ANA@example.com", "tajna-lozinka-1")?.id, user.id);

    const { token } = createSession(user.id);
    assert.equal(getUserBySessionToken(token)?.id, user.id);
    assert.equal(getUserBySessionToken("izmisljen-token"), null);
    deleteSession(token);
    assert.equal(getUserBySessionToken(token), null);
  });

  test("lozinka se ne čuva u čitljivom obliku", () => {
    const row = getDb().prepare("SELECT password_hash FROM users WHERE email = 'ana@example.com'").get() as { password_hash: string };
    assert.ok(row.password_hash.startsWith("scrypt$"));
    assert.ok(!row.password_hash.includes("tajna-lozinka-1"));
  });
});

describe("omiljeno", () => {
  test("dodavanje, redovno i uklanjanje", () => {
    const user = createUser({ email: "fav@example.com", name: "Fav", password: "lozinka-12345" });
    const slug = products[0].slug;
    assert.equal(toggleFavorite(user.id, slug), true);
    assert.equal(listFavorites(user.id).length, 1);
    setRegular(user.id, slug, true, 6);
    const [fav] = listFavorites(user.id);
    assert.equal(fav.regular, true);
    assert.equal(fav.intervalWeeks, 6);
    setRegular(user.id, slug, false);
    assert.equal(listFavorites(user.id)[0].regular, false);
    assert.equal(toggleFavorite(user.id, slug), false);
    assert.equal(listFavorites(user.id).length, 0);
    assert.throws(() => toggleFavorite(user.id, "nepostojeci"));
  });
});

describe("narudžbe", () => {
  test("kreira narudžbu, vezuje za korisnika i mijenja status", () => {
    const user = createUser({ email: "buyer@example.com", name: "Buyer", password: "lozinka-12345" });
    const sku = makeSku(products[1].slug, products[1].variants[0].id);
    const order = createOrder([{ sku, quantity: 2 }], customer, user.id);
    assert.equal(order.status, "novo");
    assert.equal(order.items[0].quantity, 2);
    assert.equal(order.totals.subtotalCents, products[1].variants[0].priceCents * 2);
    assert.equal(order.publicId.length, 14);
    assert.equal(getOrderByPublicId(order.publicId)?.id, order.id);
    assert.equal(getOrderByPublicId("nepostojeci"), null);
    assert.equal(listOrdersForUser(user.id).length, 1);
    updateOrderStatus(order.id, "poslano");
    assert.equal(getOrderByPublicId(order.publicId)?.status, "poslano");
  });

  test("neispravna korpa ne ostavlja polovičnu narudžbu", () => {
    const before = (getDb().prepare("SELECT COUNT(*) AS n FROM orders").get() as { n: number }).n;
    assert.throws(() => createOrder([{ sku: "nema:1", quantity: 1 }], customer, null), CartError);
    const after = (getDb().prepare("SELECT COUNT(*) AS n FROM orders").get() as { n: number }).n;
    assert.equal(before, after);
  });
});

describe("podsjetnici", () => {
  test("šalje se jednom po ciklusu, tek nakon naručivanja", async () => {
    const user = createUser({ email: "remind@example.com", name: "Remind", password: "lozinka-12345" });
    const p = products[2];
    setRegular(user.id, p.slug, true, 2);

    // Bez narudžbe nema šta podsjećati.
    assert.equal((await sendDueReminders()).sent, 0);

    const order = createOrder([{ sku: makeSku(p.slug, p.variants[0].id), quantity: 1 }], { ...customer, email: user.email }, user.id);
    const created = new Date(order.createdAt).getTime();
    const day = 24 * 60 * 60 * 1000;

    // Interval 2 sedmice = 14 dana, podsjetnik 5 dana ranije => od 9. dana.
    assert.equal((await sendDueReminders(new Date(created + 5 * day))).sent, 0);
    assert.equal((await sendDueReminders(new Date(created + 10 * day))).sent, 1);
    assert.equal((await sendDueReminders(new Date(created + 11 * day))).sent, 0, "ne šalje drugi put");

    // Nova narudžba otvara novi ciklus.
    getDb().prepare("UPDATE favorites SET last_reminded_at = '2000-01-01T00:00:00.000Z' WHERE user_id = ?").run(user.id);
    assert.equal((await sendDueReminders(new Date(created + 12 * day))).sent, 1);
  });

  test("ne šalje korisnicima koji su isključili podsjetnike", async () => {
    const user = createUser({ email: "optout@example.com", name: "Opt Out", password: "lozinka-12345" });
    const p = products[3];
    setRegular(user.id, p.slug, true, 1);
    const order = createOrder([{ sku: makeSku(p.slug, p.variants[0].id), quantity: 1 }], customer, user.id);
    getDb().prepare("UPDATE users SET reminders_enabled = 0 WHERE id = ?").run(user.id);
    const far = new Date(new Date(order.createdAt).getTime() + 60 * 24 * 60 * 60 * 1000);
    const result = await sendDueReminders(far);
    const row = getDb().prepare("SELECT last_reminded_at FROM favorites WHERE user_id = ? AND product_slug = ?").get(user.id, p.slug) as { last_reminded_at: string | null };
    assert.equal(row.last_reminded_at, null);
    assert.ok(result.sent >= 0);
  });
});

describe("validacija", () => {
  const valid = {
    name: "Test Kupac", email: "Kupac@Example.com", phone: "061 123 456", address: "Neka ulica 5", city: "Banja Luka",
    postalCode: "78000", note: "", paymentMethod: "pouzece", terms: "on", cart: "[]",
  };

  test("ispravan checkout prolazi i normalizuje e-mail", () => {
    const r = checkoutSchema.safeParse(valid);
    assert.ok(r.success);
    assert.equal(r.data.email, "kupac@example.com");
  });

  test("neispravni podaci daju poruke po poljima", () => {
    const r = checkoutSchema.safeParse({ ...valid, phone: "abc", postalCode: "123", email: "nije-mail", terms: undefined });
    assert.ok(!r.success);
    const errs = fieldErrors(r.error);
    assert.ok(errs.phone && errs.postalCode && errs.email && errs.terms);
  });

  test("popunjeno polje-mamac odbija formu", () => {
    assert.ok(!checkoutSchema.safeParse({ ...valid, website: "http://spam" }).success);
  });

  test("registracija traži lozinku od 8 znakova", () => {
    const r = registerSchema.safeParse({ name: "Ana", email: "ana@example.com", password: "kratko", terms: "on" });
    assert.ok(!r.success);
    assert.ok(fieldErrors(r.error).password);
  });
});

describe("ostalo", () => {
  test("newsletter ne duplira adrese", () => {
    assert.equal(subscribe("Mail@Example.com", "footer"), true);
    assert.equal(subscribe("mail@example.com", "footer"), false);
  });

  test("ograničenje pokušaja", () => {
    resetRateLimits();
    for (let i = 0; i < 3; i++) assert.ok(rateLimit("k", 3, 1000).ok);
    assert.ok(!rateLimit("k", 3, 1000).ok);
  });
});


describe("admin: upravljanje proizvodima", () => {
  const input: ProductInput = {
    name: "Hrana s ćuretinom za štence",
    pet: "pas",
    category: "suha-hrana",
    pack: "bag",
    tone: 2,
    short: "Test proizvod za štence.",
    description: ["Prvi pasus.", "Drugi pasus."],
    highlights: ["Ćuretina"],
    variants: [{ label: "2 kg", priceCents: 1200 }, { label: "10 kg", priceCents: 4500 }],
    intervalWeeks: 5,
    featured: false,
    active: true,
  };

  test("slug ispravno pretvara bosanska slova", () => {
    assert.equal(slugify("Čokolada, šećer i žvakaće đevreke!"), "cokolada-secer-i-zvakace-djevreke");
  });

  test("dodavanje proizvoda: jedinstven slug, ID-evi varijanti, vidljiv u shopu i korpi", () => {
    const a = createProduct(input, null);
    const b = createProduct(input, null);
    assert.equal(a.slug, "hrana-s-curetinom-za-stence");
    assert.equal(b.slug, "hrana-s-curetinom-za-stence-2");
    assert.deepEqual(a.variants.map((v) => v.id), ["2-kg", "10-kg"]);
    assert.ok(getProducts({ pet: "pas", category: "suha-hrana" }).some((p) => p.slug === a.slug));
    const sku = makeSku(a.slug, "2-kg");
    assert.equal(parseSku(sku)?.variant.priceCents, 1200);
    assert.equal(priceCart([{ sku, quantity: 2 }])[0].lineTotalCents, 2400);
    assert.ok(buildSkuIndex()[sku]);
  });

  test("izmjena cijene djeluje na novu narudžbu, stara narudžba zadržava staru cijenu", () => {
    const p = createProduct({ ...input, name: "Proizvod za izmjenu cijene" }, null);
    const sku = makeSku(p.slug, p.variants[0].id);
    const before = createOrder([{ sku, quantity: 1 }], customer, null);
    updateProduct(
      p.slug,
      { ...input, name: "Proizvod za izmjenu cijene", variants: p.variants.map((v) => ({ ...v, priceCents: 1999 })) },
    );
    assert.equal(parseSku(sku)?.variant.priceCents, 1999);
    assert.equal(priceCart([{ sku, quantity: 1 }])[0].unitPriceCents, 1999);
    assert.equal(getOrderByPublicId(before.publicId)?.items[0].unitPriceCents, 1200);
  });

  test("izmjena zadržava ID postojećih varijanti i slug", () => {
    const p = createProduct({ ...input, name: "Proizvod za ID" }, null);
    const updated = updateProduct(p.slug, {
      ...input,
      name: "Potpuno novi naziv",
      variants: [{ id: p.variants[1].id, label: "Preimenovano", priceCents: 4000 }],
    })!;
    assert.equal(updated.slug, p.slug);
    assert.deepEqual(updated.variants.map((v) => v.id), ["10-kg"]);
    assert.equal(parseSku(makeSku(p.slug, "2-kg")), null); // uklonjena varijanta se ne može naručiti
  });

  test("neaktivan proizvod nestaje iz shopa i ne može se naručiti, ali postoji u adminu", () => {
    const p = createProduct({ ...input, name: "Proizvod neaktivan" }, null);
    const sku = makeSku(p.slug, p.variants[0].id);
    setProductActive(p.slug, false);
    assert.equal(getProduct(p.slug), undefined);
    assert.ok(getProductAny(p.slug));
    assert.throws(() => priceCart([{ sku, quantity: 1 }]), CartError);
    setProductActive(p.slug, true);
    assert.ok(getProduct(p.slug));
  });

  test("brisanje uklanja proizvod i omiljene, a istorija narudžbi ostaje", () => {
    const p = createProduct({ ...input, name: "Proizvod za brisanje" }, "aaaaaaaaaaaaaaaaaaaaaaaa.jpg");
    const u = createUser({ email: "brisanje@example.com", name: "B", password: "lozinka123" });
    toggleFavorite(u.id, p.slug);
    const order = createOrder([{ sku: makeSku(p.slug, p.variants[0].id), quantity: 1 }], customer, u.id);
    const removed = deleteProduct(p.slug);
    assert.equal(removed?.image, "aaaaaaaaaaaaaaaaaaaaaaaa.jpg");
    assert.equal(getProductAny(p.slug), undefined);
    assert.equal(listFavorites(u.id).length, 0);
    assert.equal(getOrderByPublicId(order.publicId)?.items[0].productName, "Proizvod za brisanje");
    assert.equal(deleteProduct(p.slug), null);
  });

  test("forma: cijene, varijante i obavezna polja", () => {
    assert.equal(parsePriceKM("14,90"), 1490);
    assert.equal(parsePriceKM("14.9"), 1490);
    assert.equal(parsePriceKM("0"), null);
    assert.equal(parsePriceKM("-5"), null);
    assert.equal(parsePriceKM("abc"), null);
    assert.equal(parsePriceKM("1,234"), null);

    const fd = new FormData();
    fd.set("name", "Test hrana"); fd.set("pet", "macka"); fd.set("category", "poslastice"); fd.set("pack", "tub"); fd.set("tone", "1");
    fd.set("short", "Kratki opis"); fd.set("description", "Prvi pasus\nnastavlja se.\n\nDrugi pasus."); fd.set("highlights", "A\n\nB");
    fd.set("intervalWeeks", "4");
    fd.append("variantId", ""); fd.append("variantLabel", "500 g"); fd.append("variantPrice", "7,50");
    fd.append("variantId", ""); fd.append("variantLabel", ""); fd.append("variantPrice", "");
    const ok = parseProductForm(fd);
    assert.ok(ok.ok);
    if (ok.ok) {
      assert.deepEqual(ok.data.description, ["Prvi pasus nastavlja se.", "Drugi pasus."]);
      assert.deepEqual(ok.data.highlights, ["A", "B"]);
      assert.deepEqual(ok.data.variants, [{ id: undefined, label: "500 g", priceCents: 750 }]);
      assert.equal(ok.data.active, false);
    }

    const bad = new FormData();
    bad.set("name", "x"); bad.set("pet", "zmaj"); bad.set("intervalWeeks", "0");
    bad.append("variantLabel", "A"); bad.append("variantPrice", "nije broj");
    const res = parseProductForm(bad);
    assert.ok(!res.ok);
    if (!res.ok) for (const k of ["name", "pet", "category", "short", "description", "intervalWeeks", "variants"]) assert.ok(k in res.errors, k);
  });

  test("učitavanje fotografije: tip po sadržaju, ograničenje veličine, čitanje i brisanje", () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
    const exe = Buffer.concat([Buffer.from("MZ"), Buffer.alloc(64)]);
    assert.equal(detectImageExt(png), "png");
    assert.equal(detectImageExt(exe), null);
    assert.throws(() => saveImage(exe), UploadError);
    assert.throws(() => saveImage(Buffer.alloc(0)), UploadError);
    assert.throws(() => saveImage(Buffer.concat([png, Buffer.alloc(6 * 1024 * 1024)])), UploadError);
    const name = saveImage(png);
    assert.match(name, /^[a-f0-9]{24}\.png$/);
    assert.equal(readImage(name)?.type, "image/png");
    assert.equal(readImage("../../etc/passwd"), null);
    deleteImage(name);
    assert.equal(readImage(name), null);
  });

  test("admin račun: pravi se, ponovno pokretanje mijenja lozinku, ima admin pristup", () => {
    const first = upsertAdmin({ email: "Admin@Example.com", name: "Admin", password: "prva-lozinka-1" });
    assert.ok(first.created);
    assert.ok(first.user.isAdmin && isAdmin(first.user));
    const second = upsertAdmin({ email: "admin@example.com", name: "Admin", password: "druga-lozinka-2" });
    assert.ok(!second.created);
    assert.equal(second.user.id, first.user.id);
    assert.equal(authenticate("admin@example.com", "prva-lozinka-1"), null);
    assert.ok(authenticate("admin@example.com", "druga-lozinka-2"));
    const regular = createUser({ email: "obican@example.com", name: "O", password: "lozinka123" });
    assert.ok(!isAdmin(regular));
  });
});
