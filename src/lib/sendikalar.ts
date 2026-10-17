// Anlaşmalı sendikalar. Randevu formunda seçilir, admin panelinde gösterilir.
// Yeni bir anlaşma yapıldığında sadece bu listeye eklemek yeterli.
export const SENDIKALAR = [
  "Öz Sağlık-İş Sendikası",
  "Öz İplik İş Sendikası",
  "Öz Güven-Sen",
  "Hizmet-İş Sendikası"
] as const;

// Ana sayfadaki "Anlaşmalı kurumlar" logoları. Logo dosyası public/kurumlar/ içine konur;
// logosu olmayan kurum, adının baş harfleriyle gösterilir.
export const SENDIKA_LOGOLARI: Partial<Record<(typeof SENDIKALAR)[number], string>> = {};

// Sistem sadece anlaşmalı sendika üyeleri içindir; "Üye değilim" seçeneği yoktur.
export const SENDIKA_SECENEKLERI: string[] = [...SENDIKALAR];

export function isAnlasmaliSendika(value: string | null | undefined) {
  return Boolean(value && (SENDIKALAR as readonly string[]).includes(value));
}

// Telefonu karşılaştırma için sadece rakamlara indirger: "0538 706 10 65" -> "05387061065"
export function normalizePhone(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}
