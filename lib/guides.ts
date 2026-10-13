export type GuideSection = { heading: string; paragraphs?: string[]; list?: string[]; ordered?: boolean };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO datum
  readMinutes: number;
  intro: string;
  sections: GuideSection[];
  related: string[]; // slugovi proizvoda
};

const DISCLAIMER =
  "Ovo su opšte smjernice. Ako vaš ljubimac ima zdravstvenih problema, uzima lijekove ili je vrlo mlad ili star, o ishrani se prvo posavjetujte s veterinarom.";

export const guides: Guide[] = [
  {
    slug: "kako-preci-na-novu-hranu-za-psa",
    title: "Kako preći na novu hranu za psa u deset dana",
    description:
      "Postepen plan prelaska na novu hranu za psa, dan po dan, sa znacima na koje treba paziti i kad je bolje sačekati.",
    published: "2026-10-13",
    readMinutes: 4,
    intro:
      "Nagla promjena hrane najčešća je greška pri zamjeni. Probavni sistem psa treba vremena da se navikne na novu hranu, pa se prelazak radi postepeno, miješanjem stare i nove hrane.",
    sections: [
      {
        heading: "Plan prelaska, dan po dan",
        paragraphs: ["Ukupnu dnevnu količinu držite istom, a mijenjajte samo omjer stare i nove hrane:"],
        list: [
          "Dani 1 do 3: četvrtina nove hrane i tri četvrtine stare.",
          "Dani 4 do 6: pola nove i pola stare.",
          "Dani 7 do 9: tri četvrtine nove i četvrtina stare.",
          "Deseti dan: samo nova hrana.",
        ],
        ordered: true,
      },
      {
        heading: "Na šta paziti tokom prelaska",
        paragraphs: [
          "Pratite stolicu, apetit i energiju. Blago mekša stolica prvih dana nije neobična, ali ako proljev traje duže od dva dana, pas povraća ili odbija hranu, vratite se na staru hranu i javite se veterinaru.",
        ],
      },
      {
        heading: "Štenci i stariji psi",
        paragraphs: [
          "Štenci i stariji psi imaju osjetljiviji probavni sistem, pa za njih prelazak produžite na dvije sedmice. Kad štene odraste, hranu za štence mijenjate hranom za odrasle istim postepenim načinom.",
        ],
      },
      {
        heading: "Kad je bolje sačekati",
        paragraphs: [
          "Ne mijenjajte hranu usred selidbe, putovanja ili bolesti. Psu je tada već teško, pa dodatna promjena samo otežava stvar.",
        ],
      },
      { heading: "Napomena", paragraphs: [DISCLAIMER] },
    ],
    related: ["piletina-i-riza-odrasli-psi", "janjetina-i-povrce-odrasli-psi", "stenci-suha-hrana"],
  },
  {
    slug: "koliko-hrane-dati-macki",
    title: "Koliko hrane dati mački i kako čitati tabelu na pakovanju",
    description:
      "Kako odmjeriti dnevnu količinu hrane za mačku, kako procijeniti da li je mačka u dobroj kondiciji i koliko poslastica je previše.",
    published: "2026-10-13",
    readMinutes: 4,
    intro:
      "Tabela s preporučenim količinama na pakovanju dobra je polazna tačka, ali nije pravilo. Svaka mačka troši različito, pa količinu treba prilagoditi njoj.",
    sections: [
      {
        heading: "Mjerite, ne procjenjujte",
        paragraphs: [
          "Hranu odmjeravajte kuhinjskom vagom ili mjericom. Procjena od oka lako odstupi za desetak posto, a kod male životinje to znači stalno višak ili manjak.",
        ],
      },
      {
        heading: "Od čega zavisi potrebna količina",
        list: [
          "težina i uzrast mačke",
          "aktivnost (kućna mačka troši manje nego ona koja izlazi)",
          "sterilizacija, nakon koje se potrošnja energije obično smanji",
          "vrsta hrane, jer mokra i suha hrana imaju različitu gustinu energije",
        ],
      },
      {
        heading: "Podijelite na više obroka",
        paragraphs: [
          "Mačke se prirodno hrane u više manjih obroka. Dnevnu količinu podijelite na dva do četiri obroka ili koristite posudu koja se puni po rasporedu.",
        ],
      },
      {
        heading: "Kako znati da je količina dobra",
        paragraphs: [
          "Rebra bi trebala biti lako opipljiva pod tankim slojem masnoće, ali ne vidljiva. Gledano odozgo, mačka treba imati jasno naglašen struk. Ako rebra ne osjetite, smanjite količinu, a ako ih vidite, povećajte.",
          "Količinu mijenjajte postepeno, za oko desetinu odjednom, pa nakon dvije do tri sedmice provjerite težinu.",
        ],
      },
      {
        heading: "Poslastice računajte u dnevni unos",
        paragraphs: [
          "Uobičajeno pravilo je da poslastice ne prelaze desetinu dnevnog unosa kalorija. Ostatak treba doći iz glavne hrane.",
        ],
      },
      { heading: "Napomena", paragraphs: [DISCLAIMER] },
    ],
    related: ["piletina-i-curetina-odrasle-macke", "sterilisane-macke-suha-hrana", "kremasta-poslastica-macke"],
  },
  {
    slug: "suha-ili-mokra-hrana-za-macke",
    title: "Suha ili mokra hrana za mačke: šta odabrati",
    description:
      "Prednosti i mane suhe i mokre hrane za mačke i kako ih kombinovati, uz savjet kad odluku treba prepustiti veterinaru.",
    published: "2026-10-13",
    readMinutes: 4,
    intro:
      "Nema jedne najbolje opcije za sve mačke. Obje vrste hrane imaju prednosti, a mnogi vlasnici ih kombinuju.",
    sections: [
      {
        heading: "Suha hrana",
        list: [
          "praktična, može stajati u zdjelici tokom dana",
          "lako se odmjerava i obično je jeftinija po obroku",
          "sadrži malo vode, pa je važno da mačka ima uvijek svježu vodu",
        ],
      },
      {
        heading: "Mokra hrana",
        list: [
          "sadrži mnogo vode, što pomaže mačkama koje malo piju",
          "obično je ukusnija, pa je dobra za probirljive mačke",
          "nakon otvaranja se brzo kvari, pa neubranu hranu ne ostavljajte satima na zraku",
        ],
      },
      {
        heading: "Kombinacija",
        paragraphs: [
          "Dobar kompromis je mokra hrana jednom ili dva puta dnevno, uz suhu hranu za ostatak obroka. Pazite da ukupna količina ostane ista, a ne da se dodaje preko postojećeg.",
        ],
      },
      {
        heading: "Zubi i suha hrana",
        paragraphs: [
          "Ima uvriježeno mišljenje da suha hrana čisti zube. Ona to ne garantuje i ne zamjenjuje redovne preglede kod veterinara.",
        ],
      },
      {
        heading: "Kad odluku prepustiti veterinaru",
        paragraphs: [
          "Ako mačka ima problema s bubrezima, mokraćnim putevima, probavom ili težinom, vrstu hrane odredit će veterinar.",
        ],
      },
      { heading: "Napomena", paragraphs: [DISCLAIMER] },
    ],
    related: ["piletina-i-curetina-odrasle-macke", "losos-u-zeleu-vrecice-macke", "piletina-u-umaku-vrecice-macke"],
  },
  {
    slug: "kako-izabrati-pijesak-za-macke",
    title: "Kako izabrati pijesak za mačke",
    description:
      "Razlika između grudvajućeg i silikatnog pijeska, koliko kutija treba imati i koliko često ih čistiti.",
    published: "2026-10-13",
    readMinutes: 4,
    intro:
      "Mačke su izbirljive kad je u pitanju toalet. Ako im pijesak ili kutija ne odgovaraju, rado će potražiti drugo mjesto u kući.",
    sections: [
      {
        heading: "Grudvajući pijesak",
        paragraphs: [
          "Pravi čvrste grudve koje se svakodnevno uklanjaju lopaticom, a ostatak pijeska ostaje čist. Najčešći je izbor jer je praktičan i dobro kontroliše miris.",
        ],
      },
      {
        heading: "Silikatni pijesak",
        paragraphs: [
          "Dobro upija vlagu, ima malo prašine i lakši je za nošenje. Ne stvara grudve, pa se redovno uklanja samo čvrsti otpad, a cijeli sadržaj se mijenja u razmaku koji preporučuje proizvođač.",
        ],
      },
      {
        heading: "Koliko kutija",
        paragraphs: [
          "Pravilo je jedna kutija po mački plus jedna dodatna. Kutije stavite na mirno mjesto, dalje od posude za hranu.",
        ],
      },
      {
        heading: "Čišćenje",
        list: [
          "grudve i čvrsti otpad uklanjajte svaki dan",
          "pijesak dopunjavajte da sloj ostane dovoljno dubok",
          "kutiju povremeno operite blagim sredstvom bez jakog mirisa",
          "pijesak ne ispirajte u WC jer može začepiti cijevi",
        ],
      },
      {
        heading: "Promjena pijeska",
        paragraphs: [
          "Ako mijenjate vrstu, miješajte novi pijesak sa starim tokom nekoliko dana. Nagla promjena je čest razlog zbog kojeg mačka odbije kutiju.",
        ],
      },
    ],
    related: ["grudvajuci-pijesak-macke", "silikatni-pijesak-macke"],
  },
  {
    slug: "koliko-traje-vreca-hrane",
    title: "Koliko dugo traje vreća hrane i kako izračunati kad naručiti ponovo",
    description:
      "Jednostavan račun koji pokazuje za koliko dana se potroši vreća hrane, da naručite na vrijeme i ne ostanete bez zaliha.",
    published: "2026-10-13",
    readMinutes: 3,
    intro:
      "Najčešći razlog za hitnu kupovinu je to što vlasnik ne zna koliko hrane ostaje. Rješenje je jednostavan račun.",
    sections: [
      {
        heading: "Formula",
        paragraphs: [
          "Podijelite težinu vreće u gramima sa dnevnom količinom u gramima. Rezultat je broj dana koliko vreća traje.",
          "Primjer: vreća od 12 kg ima 12.000 g. Ako pas dnevno dobije 250 g, vreća traje 48 dana, odnosno nešto manje od sedam sedmica.",
        ],
      },
      {
        heading: "Odakle dnevna količina",
        paragraphs: [
          "Dnevnu količinu odredite prema tabeli na pakovanju i prilagodite je psu ili mački. Ako ne znate tačno, jedan dan izmjerite sve što ljubimac pojede.",
        ],
      },
      {
        heading: "Naručite prije nego što vreća bude prazna",
        paragraphs: [
          "Dostava traje nekoliko dana, pa naručujte kad vam ostane zaliha za sedam do deset dana. Ako to često zaboravljate, označite proizvod kao redovan i mi ćemo vas podsjetiti.",
        ],
      },
      {
        heading: "Šta mijenja račun",
        list: [
          "štenad i mlade mačke jedu sve više kako rastu",
          "sterilizacija i starost obično smanjuju potrebu",
          "poslastice i mokra hrana smanjuju količinu suhe hrane koja je potrebna",
        ],
      },
    ],
    related: ["piletina-i-riza-odrasli-psi", "stenci-suha-hrana", "piletina-i-curetina-odrasle-macke"],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
