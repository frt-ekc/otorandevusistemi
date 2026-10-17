// Anlaşmalı sendikalar. Randevu formunda seçilir, admin panelinde gösterilir.
// Yeni bir anlaşma yapıldığında sadece bu listeye eklemek yeterli.
export const SENDIKALAR = [
  "Öz Sağlık-İş Sendikası",
  "Öz İplik İş Sendikası",
  "Öz Güven-Sen",
  "Hizmet-İş Sendikası"
] as const;

// Ana sayfadaki "Anlaşmalı kurumlar" ve randevu formundaki sendika seçimi logoları.
// Logo dosyası public/kurumlar/ içine konur; logosu olmayan kurum, adının baş harfleriyle gösterilir.
export const SENDIKA_LOGOLARI: Partial<Record<(typeof SENDIKALAR)[number], string>> = {
  "Öz Sağlık-İş Sendikası": "/kurumlar/oz-saglik-is.jpg",
  "Öz İplik İş Sendikası": "/kurumlar/oz-iplik-is.jpg",
  "Öz Güven-Sen": "/kurumlar/oz-guven-sen.jpg",
  "Hizmet-İş Sendikası": "/kurumlar/hizmet-is.png"
};

// Logo yoksa gösterilecek baş harfler: "Öz Sağlık-İş Sendikası" -> "ÖS"
export function sendikaBasHarfleri(ad: string) {
  return ad
    .split(/[\s-]+/)
    .filter((k) => k && k !== "Sendikası")
    .slice(0, 2)
    .map((k) => k[0])
    .join("");
}

// Sistem sadece anlaşmalı sendika üyeleri içindir; "Üye değilim" seçeneği yoktur.
export const SENDIKA_SECENEKLERI: string[] = [...SENDIKALAR];

export function isAnlasmaliSendika(value: string | null | undefined) {
  return Boolean(value && (SENDIKALAR as readonly string[]).includes(value));
}

// Telefonu karşılaştırma için sadece rakamlara indirger: "0538 706 10 65" -> "05387061065"
export function normalizePhone(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}
