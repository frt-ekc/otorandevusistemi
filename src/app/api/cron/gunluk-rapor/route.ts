import { NextResponse } from "next/server";
import {
  buildRandevuExcel,
  getAktifRandevular,
  istanbulTomorrow,
  sendRaporMail
} from "@/lib/gunlukRapor";

// Vercel Cron bu adresi her akşam çağırır (bkz. vercel.json).
// Her çağrıda ertesi günün aktif randevularını Excel'e döker ve mail atar.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // Güvenlik: Vercel, CRON_SECRET tanımlıysa isteğe "Authorization: Bearer <CRON_SECRET>" ekler.
  // Başka biri bu adresi çağırıp mail tetikleyemesin diye kontrol ediyoruz.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET tanımlı değil." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Yetkisiz istek." }, { status: 401 });
  }

  // Elle test için: /api/cron/gunluk-rapor?tarih=2026-10-17
  const url = new URL(request.url);
  const tarihParam = url.searchParams.get("tarih");
  const tarih =
    tarihParam && /^\d{4}-\d{2}-\d{2}$/.test(tarihParam) ? tarihParam : istanbulTomorrow();

  try {
    const randevular = await getAktifRandevular(tarih);
    const excel = randevular.length > 0 ? await buildRandevuExcel(tarih, randevular) : null;
    const result = await sendRaporMail({ tarih, randevular, excel });
    if (!result.ok) {
      return NextResponse.json({ ok: false, tarih, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, tarih, randevuSayisi: randevular.length, mailId: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, tarih, error: message }, { status: 500 });
  }
}
