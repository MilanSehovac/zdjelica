import nodemailer, { type Transporter } from "nodemailer";
import { site, absoluteUrl } from "./site";
import { formatKM } from "./money";
import { orderNumber } from "./ids";
import { PAYMENT_METHODS, type Order } from "./orders";

type Mail = { to: string; subject: string; text: string; html: string };

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

/** Pošta se šalje preko SMTP-a; bez podešenog SMTP-a poruka se samo ispisuje u konzolu (razvoj). */
export async function sendMail(mail: Mail): Promise<boolean> {
  const t = getTransporter();
  const from = process.env.MAIL_FROM ?? `${site.name} <${site.email}>`;
  if (!t) {
    console.log(`[mail:dev] ${mail.to} | ${mail.subject}\n${mail.text}\n`);
    return true;
  }
  try {
    await t.sendMail({ from, ...mail });
    return true;
  } catch (err) {
    console.error("[mail] slanje nije uspjelo:", err);
    return false;
  }
}

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(title: string, body: string) {
  return `<!doctype html><html lang="bs"><body style="margin:0;background:#f3f8f6;font-family:Arial,Helvetica,sans-serif;color:#0f2f33">
<div style="max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:22px;font-weight:700;margin:0 0 16px;color:#1b6460">${esc(site.name)}</p>
<div style="background:#ffffff;border-radius:16px;padding:24px">
<h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>${body}</div>
<p style="font-size:12px;color:#3d5a5c;margin-top:16px">${esc(site.name)} · ${esc(site.email)}</p>
</div></body></html>`;
}

function itemsTable(order: Order) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${esc(i.productName)} (${esc(i.variantLabel)}) × ${i.quantity}</td><td style="padding:6px 0;text-align:right;white-space:nowrap">${formatKM(i.lineTotalCents)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
<tr><td style="padding-top:10px;border-top:1px solid #d3e2dd">Dostava</td><td style="padding-top:10px;border-top:1px solid #d3e2dd;text-align:right">${order.totals.shippingCents === 0 ? "Besplatna" : formatKM(order.totals.shippingCents)}</td></tr>
<tr><td style="padding-top:6px;font-weight:700">Ukupno za platiti</td><td style="padding-top:6px;text-align:right;font-weight:700">${formatKM(order.totals.totalCents)}</td></tr></table>`;
}

function itemsText(order: Order) {
  return order.items.map((i) => `- ${i.productName} (${i.variantLabel}) x ${i.quantity}: ${formatKM(i.lineTotalCents)}`).join("\n");
}

export function orderConfirmationMail(order: Order): Mail {
  const number = orderNumber(order.id);
  const link = absoluteUrl(`/narudzba/${order.publicId}`);
  const c = order.customer;
  return {
    to: c.email,
    subject: `Narudžba ${number} je primljena`,
    text: `Hvala na narudžbi, ${c.name}!\n\nBroj narudžbe: ${number}\n\n${itemsText(order)}\nDostava: ${order.totals.shippingCents === 0 ? "Besplatna" : formatKM(order.totals.shippingCents)}\nUkupno za platiti: ${formatKM(order.totals.totalCents)}\n\nPlaćanje: ${PAYMENT_METHODS[c.paymentMethod]} pri preuzimanju.\nAdresa dostave: ${c.address}, ${c.postalCode} ${c.city}\nOčekivana dostava: ${site.shipping.estimate}.\n\nPregled narudžbe: ${link}\n`,
    html: layout(
      `Hvala na narudžbi, ${c.name}!`,
      `<p style="margin:0 0 12px">Broj narudžbe: <strong>${number}</strong></p>${itemsTable(order)}
<p style="font-size:14px;margin:16px 0 0">Plaćanje: ${esc(PAYMENT_METHODS[c.paymentMethod])} pri preuzimanju.<br>Adresa dostave: ${esc(c.address)}, ${esc(c.postalCode)} ${esc(c.city)}<br>Očekivana dostava: ${esc(site.shipping.estimate)}.</p>
<p style="margin:16px 0 0"><a href="${link}" style="color:#1b6460">Pregled narudžbe</a></p>`,
    ),
  };
}

/** Obavijest vlasniku: sve što treba da proslijedi narudžbu dobavljaču. */
export function ownerNotificationMail(order: Order, to: string): Mail {
  const number = orderNumber(order.id);
  const c = order.customer;
  return {
    to,
    subject: `Nova narudžba ${number} (${formatKM(order.totals.totalCents)})`,
    text: `Nova narudžba ${number}\n\nKupac: ${c.name}\nE-mail: ${c.email}\nTelefon: ${c.phone}\nAdresa: ${c.address}, ${c.postalCode} ${c.city}\nNapomena: ${c.note || "-"}\nPlaćanje: ${PAYMENT_METHODS[c.paymentMethod]}\n\n${itemsText(order)}\nDostava: ${formatKM(order.totals.shippingCents)}\nUkupno za naplatu: ${formatKM(order.totals.totalCents)}\n\nUpravljanje: ${absoluteUrl("/admin/narudzbe")}\n`,
    html: layout(
      `Nova narudžba ${number}`,
      `<p style="font-size:14px;margin:0 0 12px">${esc(c.name)}<br>${esc(c.email)} · ${esc(c.phone)}<br>${esc(c.address)}, ${esc(c.postalCode)} ${esc(c.city)}<br>Napomena: ${esc(c.note || "-")}</p>${itemsTable(order)}
<p style="margin:16px 0 0"><a href="${absoluteUrl("/admin/narudzbe")}" style="color:#1b6460">Otvori narudžbe</a></p>`,
    ),
  };
}

export function welcomeMail(to: string): Mail {
  return {
    to,
    subject: `Dobrodošli u ${site.name}`,
    text: `Hvala što ste se prijavili.\n\nSlat ćemo vam rijetke, korisne poruke o ishrani ljubimaca i novim proizvodima.\nOdjava: odgovorite na ovu poruku s riječju "odjava".\n\n${absoluteUrl("/")}\n`,
    html: layout(
      "Hvala što ste se prijavili",
      `<p style="font-size:14px;margin:0 0 12px">Slat ćemo vam rijetke, korisne poruke o ishrani ljubimaca i novim proizvodima.</p>
<p style="font-size:14px;margin:0">Odjava: odgovorite na ovu poruku s riječju „odjava“.</p>
<p style="margin:16px 0 0"><a href="${absoluteUrl("/")}" style="color:#1b6460">Posjetite prodavnicu</a></p>`,
    ),
  };
}

export function reminderMail(to: string, name: string, products: { name: string; weeks: number }[]): Mail {
  const link = absoluteUrl("/omiljeno");
  const list = products.map((p) => `- ${p.name} (otprilike svakih ${p.weeks} sedmica)`).join("\n");
  const htmlList = products.map((p) => `<li style="margin:4px 0">${esc(p.name)}</li>`).join("");
  return {
    to,
    subject: "Vrijeme je da dopunite zalihe za ljubimca",
    text: `Zdravo ${name},\n\nPrema vašem rasporedu uskoro vam trebaju:\n${list}\n\nNaručite u par klikova: ${link}\n\nPodsjetnike možete isključiti u postavkama računa: ${absoluteUrl("/racun")}\n`,
    html: layout(
      `Zdravo ${name}, vrijeme je za dopunu`,
      `<p style="font-size:14px;margin:0 0 8px">Prema vašem rasporedu uskoro vam trebaju:</p><ul style="font-size:14px;padding-left:20px;margin:0 0 16px">${htmlList}</ul>
<p style="margin:0 0 16px"><a href="${link}" style="background:#f7c948;color:#0f2f33;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block">Naruči ponovo</a></p>
<p style="font-size:12px;color:#3d5a5c;margin:0">Podsjetnike možete isključiti u <a href="${absoluteUrl("/racun")}" style="color:#1b6460">postavkama računa</a>.</p>`,
    ),
  };
}
