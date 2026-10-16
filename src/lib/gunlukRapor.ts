import ExcelJS from "exceljs";
import { getSupabaseServerClient } from "@/lib/supabase";
import { RANDEVU_KOLONLARI, type RandevuRow } from "@/lib/db";
import { formatTL, paketAciklamasi } from "@/lib/lastikPaketleri";

const TIME_ZONE = "Europe/Istanbul";

// İstanbul saatine göre bugünün tarihini YYYY-MM-DD olarak verir.
function istanbulToday() {
  // en-CA biçimi doğrudan YYYY-MM-DD üretir
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

// YYYY-MM-DD tarihine gün ekler (saat dilimi kaymasından etkilenmemek için UTC üzerinden).
function addDays(isoDate: string, days: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function istanbulTomorrow() {
  return addDays(istanbulToday(), 1);
}

export function formatTrDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long"
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

// Randevu notu "İşlem: ...\nNot: ..." biçiminde kaydediliyor; Excel'de ayrı sütunlara bölüyoruz.
function splitNot(notMetni: string | null) {
  const text = notMetni ?? "";
  let islem = "";
  const notlar: string[] = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("İşlem: ")) islem = line.slice("İşlem: ".length);
    else if (line.startsWith("Not: ")) notlar.push(line.slice("Not: ".length));
    else if (line.trim()) notlar.push(line);
  }
  return { islem, not: notlar.join(" ") };
}

// Yeni kayıtlarda paket bilgisi kolonlardan, eski kayıtlarda nottaki "İşlem:" satırından gelir.
function islemMetni(r: RandevuRow) {
  return paketAciklamasi(r) || splitNot(r.not_metni).islem;
}

export async function getAktifRandevular(tarih: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("randevular")
    .select(RANDEVU_KOLONLARI)
    .eq("tarih", tarih)
    .neq("durum", "iptal")
    .order("saat", { ascending: true });

  if (error) {
    throw new Error(`Randevular okunamadı: ${error.message}`);
  }
  return (data ?? []) as RandevuRow[];
}

export async function buildRandevuExcel(tarih: string, randevular: RandevuRow[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Fırat Oto Lastik Randevu Sistemi";
  const sheet = workbook.addWorksheet("Randevular", {
    views: [{ state: "frozen", ySplit: 2 }]
  });

  sheet.columns = [
    { key: "saat", width: 8 },
    { key: "ad", width: 24 },
    { key: "telefon", width: 16 },
    { key: "sendika", width: 24 },
    { key: "hizmet", width: 22 },
    { key: "islem", width: 30 },
    { key: "fiyat", width: 12, style: { numFmt: '#,##0 "₺"' } },
    { key: "not", width: 30 },
    { key: "durum", width: 12 },
    { key: "kayit", width: 18 }
  ];

  // 1. satır: başlık
  sheet.mergeCells("A1:J1");
  const title = sheet.getCell("A1");
  title.value = `${formatTrDate(tarih)} randevuları (${randevular.length} adet)`;
  title.font = { bold: true, size: 14 };

  // 2. satır: sütun başlıkları
  const header = sheet.getRow(2);
  header.values = [
    "Saat",
    "Ad Soyad",
    "Telefon",
    "Sendika",
    "Hizmet",
    "Paket",
    "Ücret",
    "Ek Not",
    "Durum",
    "Kayıt Zamanı"
  ];
  header.font = { bold: true, color: { argb: "FF111111" } };
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFBBF24" } };
    cell.border = { bottom: { style: "thin" } };
  });

  for (const r of randevular) {
    const { not } = splitNot(r.not_metni);
    const row = sheet.addRow({
      saat: String(r.saat ?? "").slice(0, 5),
      ad: r.ad,
      telefon: r.telefon,
      sendika: r.sendika ?? "-",
      hizmet: r.hizmet,
      islem: islemMetni(r) || "-",
      fiyat: r.fiyat ?? null,
      not: not || "",
      durum: r.durum,
      kayit: r.created_at
        ? new Intl.DateTimeFormat("tr-TR", {
            timeZone: TIME_ZONE,
            dateStyle: "short",
            timeStyle: "short"
          }).format(new Date(r.created_at))
        : ""
    });
    row.alignment = { vertical: "top", wrapText: true };
  }

  sheet.autoFilter = { from: "A2", to: "J2" };

  // Toplam satırı
  const toplam = randevular.reduce((sum, r) => sum + (r.fiyat ?? 0), 0);
  const toplamRow = sheet.addRow({ islem: "TOPLAM", fiyat: toplam });
  toplamRow.font = { bold: true };
  toplamRow.getCell("fiyat").border = { top: { style: "thin" } };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

// Resend REST API ile mail gönderir (ek paket gerekmez).
export async function sendRaporMail(params: {
  tarih: string;
  randevular: RandevuRow[];
  excel: Buffer | null;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RAPOR_MAIL_ADRESI;
  const from = process.env.RAPOR_GONDEREN ?? "Randevu Sistemi <onboarding@resend.dev>";
  if (!apiKey || !to) {
    return { ok: false, error: "RESEND_API_KEY veya RAPOR_MAIL_ADRESI tanımlı değil." };
  }

  const tarihTr = formatTrDate(params.tarih);
  const count = params.randevular.length;
  const satirlar = params.randevular
    .map((r) => {
      const islem = islemMetni(r);
      return `<li><b>${String(r.saat ?? "").slice(0, 5)}</b> · ${escapeHtml(r.ad)} · ${escapeHtml(r.hizmet)}${
        islem ? ` · ${escapeHtml(islem)}` : ""
      }${r.fiyat ? ` · <b>${formatTL(r.fiyat)}</b>` : ""}</li>`;
    })
    .join("");

  const html =
    count > 0
      ? `<p>${tarihTr} için <b>${count}</b> aktif randevu var, beklenen toplam <b>${formatTL(
          params.randevular.reduce((sum, r) => sum + (r.fiyat ?? 0), 0)
        )}</b>. Tüm bilgiler ekteki Excel dosyasında.</p><ul>${satirlar}</ul>`
      : `<p>${tarihTr} için aktif randevu bulunmuyor.</p>`;

  const body: Record<string, unknown> = {
    from,
    to: to.split(",").map((s) => s.trim()).filter(Boolean),
    subject: `Yarının randevuları: ${tarihTr} (${count} adet)`,
    html
  };
  if (params.excel && count > 0) {
    body.attachments = [
      { filename: `randevular-${params.tarih}.xlsx`, content: params.excel.toString("base64") }
    ];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    return { ok: false, error: json.message ?? `Resend hatası (${res.status})` };
  }
  return { ok: true, id: json.id };
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
