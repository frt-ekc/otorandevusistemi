// Sendika anlaşmalı hizmetler ve fiyatlar (afişteki fiyatlar).
// Fiyat değişirse SADECE bu dosya güncellenir; form, sunucu kontrolü,
// admin paneli ve Excel raporu fiyatı buradan okur.

export type HizmetKey = "degisim" | "tamir";
export type AracTuru = "binek" | "ticari";

export const HIZMETLER: Record<HizmetKey, { ad: string; aciklama: string }> = {
  degisim: {
    ad: "Lastik Değişimi",
    aciklama: "Binek veya ticari araç, tek, 2 ya da 4 lastik. Balans dahil."
  },
  tamir: {
    ad: "Lastik Tamiri",
    aciklama: "Patlak lastik tamiri, sabit fiyat."
  }
};

export const ARAC_TURLERI: Record<AracTuru, { ad: string; aciklama: string }> = {
  binek: { ad: "Binek Araç", aciklama: "Otomobil, SUV" },
  ticari: { ad: "Ticari Araç", aciklama: "Pikap ve minibüs" }
};

// Bir değişim paketi: kaç lastik değişir, kaçına balans yapılır, fiyatı ne.
// id formdan sunucuya gider ("4-2" = 4 lastik, 2 balans).
export type DegisimPaketi = { id: string; lastik: number; balans: number; fiyat: number };

// Binek: 1 adet 150 TL (balans dahil), 2 adet 300 TL (2 balans), 4 adet 2 balans 500 TL, 4 adet 4 balans 600 TL
// Ticari: 1 adet 200 TL (balans dahil), 2 adet 400 TL (2 balans), 4 adet 800 TL (4 balans)
export const DEGISIM_PAKETLERI: Record<AracTuru, DegisimPaketi[]> = {
  binek: [
    { id: "1-1", lastik: 1, balans: 1, fiyat: 150 },
    { id: "2-2", lastik: 2, balans: 2, fiyat: 300 },
    { id: "4-2", lastik: 4, balans: 2, fiyat: 500 },
    { id: "4-4", lastik: 4, balans: 4, fiyat: 600 }
  ],
  ticari: [
    { id: "1-1", lastik: 1, balans: 1, fiyat: 200 },
    { id: "2-2", lastik: 2, balans: 2, fiyat: 400 },
    { id: "4-4", lastik: 4, balans: 4, fiyat: 800 }
  ]
};

// "Tek lastik değişimi", "4 lastik değişimi"
export function lastikEtiketi(adet: number) {
  return `${adet === 1 ? "Tek" : adet} lastik değişimi`;
}

// "Balans dahil", "İki lastiğe de balans", "4 lastiğin hepsine balans", "Sadece 2 lastiğe balans"
export function balansEtiketi(p: Pick<DegisimPaketi, "lastik" | "balans">) {
  if (p.lastik === 1) return "Balans dahil";
  if (p.balans === p.lastik) return p.lastik === 2 ? "İki lastiğe de balans" : `${p.lastik} lastiğin hepsine balans`;
  return `Sadece ${p.balans} lastiğe balans`;
}

export const TAMIR_FIYATI = 200;

export type PaketSonucu = {
  hizmetKey: HizmetKey;
  hizmetAdi: string;
  aracTuru: AracTuru | null;
  paketId: string | null;
  lastikAdedi: number | null;
  balansAdedi: number | null;
  fiyat: number;
};

// Seçimden fiyatı hesaplar. Geçersiz bir seçimde null döner.
// Sunucu da bu fonksiyonu kullanır: tarayıcıdan gelen fiyata güvenilmez.
export function paketHesapla(
  hizmetKey: string | null | undefined,
  aracTuru?: string | null,
  paketId?: string | null
): PaketSonucu | null {
  if (hizmetKey === "tamir") {
    return {
      hizmetKey: "tamir",
      hizmetAdi: HIZMETLER.tamir.ad,
      aracTuru: null,
      paketId: null,
      lastikAdedi: null,
      balansAdedi: null,
      fiyat: TAMIR_FIYATI
    };
  }
  if (hizmetKey !== "degisim") return null;
  if (aracTuru !== "binek" && aracTuru !== "ticari") return null;
  const paket = DEGISIM_PAKETLERI[aracTuru].find((p) => p.id === paketId);
  if (!paket) return null;
  return {
    hizmetKey: "degisim",
    hizmetAdi: HIZMETLER.degisim.ad,
    aracTuru,
    paketId: paket.id,
    lastikAdedi: paket.lastik,
    balansAdedi: paket.balans,
    fiyat: paket.fiyat
  };
}

export function formatTL(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString("tr-TR")} ₺`;
}

// Randevu kaydındaki alanlardan okunur açıklama: "Binek Araç · 4 lastik · 2 balans"
export function paketAciklamasi(row: {
  arac_turu?: string | null;
  lastik_adedi?: number | null;
  balans_adedi?: number | null;
}) {
  const parcalar: string[] = [];
  if (row.arac_turu && row.arac_turu in ARAC_TURLERI) {
    parcalar.push(ARAC_TURLERI[row.arac_turu as AracTuru].ad);
  }
  if (row.lastik_adedi) parcalar.push(`${row.lastik_adedi} lastik`);
  if (row.balans_adedi) parcalar.push(`${row.balans_adedi} balans`);
  return parcalar.join(" · ");
}

// Hizmetler sayfasından "?service=..." ile gelinirse hangi hizmetin seçili açılacağı
export function hizmetKeyFromName(name: string | null | undefined): HizmetKey | null {
  const n = String(name ?? "").toLocaleLowerCase("tr-TR");
  if (n.includes("değişim") || n.includes("degisim")) return "degisim";
  if (n.includes("tamir")) return "tamir";
  return null;
}
