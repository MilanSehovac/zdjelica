# Zdjelica

Web prodavnica hrane za pse i mačke (Next.js 16, React 19, TypeScript, Tailwind 4).
Namijenjena za prodaju bez skladišta: kupac naručuje i plaća pouzećem, vi proslijedite narudžbu dobavljaču.

## Pokretanje

Potreban je **Node.js 22.13 ili noviji** (baza koristi ugrađeni `node:sqlite`, nema native zavisnosti).

```bash
npm install
cp .env.example .env.local     # na Windowsu: copy .env.example .env.local
npm run dev                    # http://localhost:3000
```

Napravite admin račun (jednom):

```bash
npm run admin:create -- vasa@adresa.ba "Vaše Ime" "duga-lozinka"
```

Zatim se prijavite na `/prijava` i otvorite `/admin`. Istu komandu možete ponoviti da postavite novu lozinku.

Produkcija: `npm run build` pa `npm start`.
Provjere: `npm run typecheck` i `npm test` (logika korpe, cijena, korisnika, narudžbi i podsjetnika).

## Šta je gotovo

- Početna, stranice za pse i mačke, kategorije, proizvod (varijante pakovanja), korpa, plaćanje, potvrda narudžbe.
- Registracija, prijava, odjava (sesije u bazi, lozinke hashirane scrypt-om).
- Omiljeni proizvodi (srce) i oznaka "uzimam redovno" sa razmakom u sedmicama.
- E-mail: potvrda kupcu, obavijest vama o novoj narudžbi, podsjetnik za redovne proizvode, dobrodošlica za newsletter.
- Račun sa historijom narudžbi i dugmetom "Naruči ponovo".
- Admin dashboard (`/admin`): proizvodi i narudžbe.
  - **Proizvodi** (`/admin/proizvodi`): dodavanje, izmjena (naziv, opis, kategorija, varijante i cijene, fotografija), sakrivanje i brisanje. Izmjene su odmah vidljive u shopu, sitemapu i pretrazi.
  - **Narudžbe** (`/admin/narudzbe`): pregled i promjena statusa.
  - Fotografije se pri učitavanju kadriraju u kvadrat i smanjuju u pregledniku (WebP, do 1000 px), a server prima samo JPG/PNG/WebP do 5 MB. Čuvaju se u folderu `uploads` pored baze.
  - Stare narudžbe čuvaju vlastiti snimak naziva i cijene, pa brisanje ili izmjena proizvoda ne mijenja istoriju.
- SEO: metadata i canonical na svakoj stranici, sitemap, robots, JSON-LD (Organization, WebSite, FAQ, Product, Breadcrumb, Article, ItemList), slike za dijeljenje, 5 vodiča.
- Cijene se uvijek računaju na serveru iz kataloga; klijent šalje samo šifre i količine.

## Prije puštanja u rad

1. **Zamijenite demo proizvode** stvarnim: u `/admin/proizvodi` obrišite demo proizvode (pri prvom pokretanju baza se puni sa 16 primjera iz `lib/seed-products.ts`; nakon brisanja se ne vraćaju) i dodajte svoje s cijenama od dobavljača i fotografijama. Proizvod bez fotografije prikazuje ilustraciju pakovanja.
   SEO tekstovi kategorija (`LANDING` u `lib/catalog.ts`) su i dalje u kodu.
2. **Popunite podatke o firmi** (`NEXT_PUBLIC_COMPANY_*`, kontakt) i dajte pravnicima da pregledaju stranice *Uslovi*, *Privatnost*, *Povrat i reklamacije*. To su polazni tekstovi, nisu pravni savjet.
3. **Podesite e-poštu** (SMTP), `ORDER_NOTIFY_EMAIL`, `ADMIN_EMAILS` i `CRON_SECRET`.
4. Postavite `NEXT_PUBLIC_SITE_URL` na pravu adresu **prije builda**.
5. Provjerite pravila dostave u `lib/site.ts` (cijena, prag besplatne dostave, rok).

## Tok narudžbe (bez skladišta)

1. Kupac naruči, vama stiže e-mail (`ORDER_NOTIFY_EMAIL`) sa svim podacima.
2. Narudžbu proslijedite dobavljaču i promijenite status u `/admin/narudzbe`.
3. Kupac vidi status na stranici narudžbe i u računu.

## Podsjetnici za redovnu narudžbu

Poziv jednom dnevno (cron na serveru):

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://vasa-domena.ba/api/cron/reminders
```

Podsjetnik se šalje 5 dana prije isteka razmaka (`reminderLeadDays` u `lib/site.ts`), jednom po ciklusu, i samo korisnicima koji nisu isključili podsjetnike.

## Hosting

Baza je jedan SQLite fajl, pa shop treba **server sa trajnim diskom** (VPS, npr. iza nginx-a sa HTTPS-om).
Na serverless platformama (Vercel i slično) računi i narudžbe se ne bi sačuvali; tamo je potrebno zamijeniti `lib/db.ts` hostovanom bazom.
Postavite `DATABASE_PATH` na putanju koju redovno kopirate (backup). **U backup uključite i folder `uploads` pored baze** (fotografije proizvoda).
Javne stranice su statične i osvježavaju se same kad u adminu sačuvate izmjenu.

## Lighthouse

Pokrenite `npm run build && npm start`, pa u Chromeu otvorite DevTools, tab Lighthouse. Mjerite u anonimnom prozoru bez ekstenzija.
Stranice koje nisu za pretragu (korpa, plaćanje, račun, prijava) namjerno imaju `noindex`, pa SEO kategorija za njih ne može biti 100.

## Poznata ograničenja

- Plaćanje karticom nije ugrađeno (samo pouzeće). Za karticu je potreban procesor koji radi sa firmom iz BiH.
- Nema pretrage proizvoda. Jedan proizvod ima jednu fotografiju. Adresa proizvoda (slug) se ne mijenja nakon dodavanja.
- Admin pravo imaju računi napravljeni komandom `admin:create` i adrese iz `ADMIN_EMAILS`.
- Ograničenje broja pokušaja (prijava, narudžbe) živi u memoriji procesa; dovoljno za jedan server.
- Newsletter prikuplja adrese (tabela `subscribers`), ali kampanje šaljete iz vlastitog alata.
