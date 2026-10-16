// Anlaşmalı sendikalar. Randevu formunda seçilir, admin panelinde gösterilir.
// Yeni bir anlaşma yapıldığında sadece bu listeye eklemek yeterli.
export const SENDIKA_YOK = "Üye değilim";

export const SENDIKALAR = [
  "Öz Sağlık-İş Sendikası",
  "Öz İplik İş Sendikası",
  "Öz Güven-Sen"
] as const;

export const SENDIKA_SECENEKLERI: string[] = [...SENDIKALAR, SENDIKA_YOK];

export function isAnlasmaliSendika(value: string | null | undefined) {
  return Boolean(value && (SENDIKALAR as readonly string[]).includes(value));
}

// Telefonu karşılaştırma için sadece rakamlara indirger: "0538 706 10 65" -> "05387061065"
export function normalizePhone(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}
