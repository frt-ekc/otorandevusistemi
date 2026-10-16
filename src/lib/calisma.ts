// Randevu takvimi kuralları: çalışma saatleri, hizmet süreleri, çakışma kontrolü.
// Hem tarayıcı (randevu formu) hem sunucu (kayıt kontrolü) bu dosyayı kullanır.
// Çalışma saatleri admin panelindeki "ayarlar" tablosundan gelir (sitede gösterilen saatlerle aynı).

import type { AyarlarRow } from "@/lib/db";

export const SLOT_ARALIGI = 30; // dakika
export const ILERI_GUN = 30; // en fazla kaç gün sonrasına randevu alınabilir

// Haftanın günü (0 = Pazar ... 6 = Cumartesi) -> açık olduğu aralık (dakika) ya da kapalıysa null
export type Aralik = { start: number; end: number };
export type CalismaSaatleri = Record<number, Aralik | null>;

// Ayarlar tablosu boşsa sitede gösterilen varsayılanlar
const VARSAYILAN = { hafta_ici: "09:00 - 18:00", cumartesi: "09:00 - 16:00", pazar: "Kapalı" };

// "09:00 - 18:00" -> { start: 540, end: 1080 }. "Kapalı" ya da okunamayan metin -> null (kapalı gün)
export function parseAralik(metin: string | null | undefined): Aralik | null {
  const m = String(metin ?? "").match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
  if (!m) return null;
  const start = Number(m[1]) * 60 + Number(m[2]);
  const end = Number(m[3]) * 60 + Number(m[4]);
  return end > start ? { start, end } : null;
}

export function calismaSaatleri(ayarlar: Pick<AyarlarRow, "hafta_ici" | "cumartesi" | "pazar"> | null): CalismaSaatleri {
  const haftaIci = parseAralik(ayarlar?.hafta_ici ?? VARSAYILAN.hafta_ici);
  return {
    0: parseAralik(ayarlar?.pazar ?? VARSAYILAN.pazar),
    1: haftaIci,
    2: haftaIci,
    3: haftaIci,
    4: haftaIci,
    5: haftaIci,
    6: parseAralik(ayarlar?.cumartesi ?? VARSAYILAN.cumartesi)
  };
}

// Hizmetin dükkânda kapladığı süre. Tek lastik ve tamir yarım saat, 4 lastik bir saat.
export function hizmetSuresi(row: { hizmet?: string | null; hizmetKey?: string | null; lastik_adedi?: number | null }) {
  const degisim = row.hizmetKey === "degisim" || /değişim|degisim/i.test(row.hizmet ?? "");
  return degisim && Number(row.lastik_adedi) === 4 ? 60 : 30;
}

export function dakikaToSaat(dk: number) {
  return `${String(Math.floor(dk / 60)).padStart(2, "0")}:${String(dk % 60).padStart(2, "0")}`;
}

// "8:00", "08:00:00", "08.00" -> 480
export function saatToDakika(saat: string | null | undefined) {
  const m = String(saat ?? "").trim().match(/^(\d{1,2})[:.](\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
}

// "2026-10-19" -> haftanın günü (saat diliminden bağımsız)
export function haftaninGunu(tarih: string) {
  const [y, mo, d] = tarih.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

// Türkiye saatine göre bugünün tarihi ve dakikası (sunucu UTC'de çalışsa da doğru sonuç verir)
export function istanbulSimdi(now = new Date()) {
  const parca = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  return { tarih: `${parca.year}-${parca.month}-${parca.day}`, dakika: Number(parca.hour) * 60 + Number(parca.minute) };
}

export function tarihEkle(tarih: string, gun: number) {
  const [y, mo, d] = tarih.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d + gun)).toISOString().slice(0, 10);
}

// O gün, verilen süredeki bir hizmetin başlayabileceği tüm saatler (kapanıştan önce bitmeli)
export function gununSaatleri(saatler: CalismaSaatleri, tarih: string, sure: number) {
  const aralik = saatler[haftaninGunu(tarih)];
  if (!aralik) return [];
  const sonuc: string[] = [];
  for (let t = aralik.start; t + sure <= aralik.end; t += SLOT_ARALIGI) sonuc.push(dakikaToSaat(t));
  return sonuc;
}

// Mevcut randevularla çakışan başlangıç saatleri ("Dolu" gösterilir)
export function doluSaatler(adaylar: string[], sure: number, mevcut: Aralik[]) {
  return adaylar.filter((saat) => {
    const start = saatToDakika(saat);
    return mevcut.some((r) => start < r.end && r.start < start + sure);
  });
}
