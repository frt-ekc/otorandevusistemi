"use client";

import { useEffect, useState } from "react";
import { saatiGeldi } from "@/components/admin/RandevuSekmeleri";
import { istanbulSimdi } from "@/lib/calisma";
import { formatTL } from "@/lib/lastikPaketleri";
import type { RandevuRow } from "@/lib/db";

// "2026-10" -> "Ekim 2026"
function ayBasligi(ay: string) {
  const [y, m] = ay.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, 1))
  );
}

const toplamTutar = (liste: RandevuRow[]) => liste.reduce((t, r) => t + (r.fiyat ?? 0), 0);

// Kazanç sadece saati geçmiş (gerçekleşmiş) ve iptal edilmemiş randevulardan hesaplanır.
// Sayfa açık kalsa da saati gelen randevu 30 sn içinde tutara eklenir.
export default function KazancOzeti({ randevular }: { randevular: RandevuRow[] }) {
  const [simdi, setSimdi] = useState(() => istanbulSimdi());
  useEffect(() => {
    const t = setInterval(() => setSimdi(istanbulSimdi()), 30_000);
    return () => clearInterval(t);
  }, []);

  const gerceklesenler = randevular.filter((r) => r.durum !== "iptal" && saatiGeldi(r, simdi));
  const buAy = simdi.tarih.slice(0, 7);
  const buAyGerceklesen = gerceklesenler.filter((r) => r.tarih.startsWith(buAy));
  const kutular = [
    { label: `Bu ay kazanılan (${ayBasligi(buAy)})`, tutar: toplamTutar(buAyGerceklesen), adet: buAyGerceklesen.length },
    { label: "Toplam kazanılan", tutar: toplamTutar(gerceklesenler), adet: gerceklesenler.length }
  ];

  // Ay ay döküm, en yeni ay üstte
  const aylar = new Map<string, RandevuRow[]>();
  for (const r of gerceklesenler) {
    const ay = r.tarih.slice(0, 7);
    aylar.set(ay, [...(aylar.get(ay) ?? []), r]);
  }
  const aylik = [...aylar.entries()].sort(([a], [b]) => b.localeCompare(a));

  return (
    <>
      <section className="grid grid-cols-2 gap-2 sm:gap-4">
        {kutular.map((k) => (
          <div key={k.label} className="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 sm:p-6">
            <p className="text-xs leading-tight text-brand-muted sm:text-sm">{k.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-emerald-300 sm:mt-4 sm:text-4xl">{formatTL(k.tutar)}</p>
            <p className="mt-1 text-xs text-brand-muted">{k.adet} gerçekleşen randevu</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6">
        <p className="text-sm font-semibold text-brand-gold">Aylık döküm</p>
        <p className="mt-1 text-sm text-brand-muted">
          Randevunun saati geçince tutarı kazanca eklenir. İptal edilen randevular sayılmaz.
        </p>
        {aylik.length === 0 ? (
          <p className="mt-6 text-sm italic text-brand-muted">Henüz gerçekleşen randevu yok.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {aylik.map(([ay, liste]) => (
              <li key={ay} className="flex items-baseline justify-between gap-4 px-2 py-3">
                <span className="font-bold text-brand-text">{ayBasligi(ay)}</span>
                <span className="flex items-baseline gap-3">
                  <span className="text-xs text-brand-muted">{liste.length} randevu</span>
                  <span className="font-display text-lg font-extrabold tabular-nums text-emerald-300">
                    {formatTL(toplamTutar(liste))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
