"use client";

import { useState, type ReactNode } from "react";
import RandevuCalendar from "@/components/admin/RandevuCalendar";
import RandevuList from "@/components/admin/RandevuList";
import type { HizmetRow, RandevuRow } from "@/lib/db";

type Sekme = "takvim" | "aktif" | "iptal";

// Takvim / Aktif / İptal aynı veriyi farklı süzer. Veri sayfa açılırken bir kez gelir,
// sekmeler arası geçiş sunucuya gitmeden anında olur. Adres çubuğu da güncellenir ki
// sayfa yenilenince aynı sekme açılsın.
export default function RandevuSekmeleri({
  randevular,
  hizmetler,
  ilkSekme,
  bildirim,
  onCancel,
  onDelete
}: {
  randevular: RandevuRow[];
  hizmetler: HizmetRow[];
  ilkSekme: string;
  bildirim?: ReactNode;
  onCancel: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [sekme, setSekme] = useState<Sekme>(
    ilkSekme === "aktif" || ilkSekme === "iptal" ? ilkSekme : "takvim"
  );

  const aktifler = randevular.filter((r) => r.durum !== "iptal");
  const iptaller = randevular.filter((r) => r.durum === "iptal");

  const sekmeler: { slug: Sekme; label: string; count: number }[] = [
    { slug: "takvim", label: "Takvim Görünümü", count: aktifler.length },
    { slug: "aktif", label: "Aktif Randevular", count: aktifler.length },
    { slug: "iptal", label: "İptal Edilenler", count: iptaller.length }
  ];

  const sec = (slug: Sekme) => {
    setSekme(slug);
    window.history.replaceState(null, "", `/admin?view=randevular&tab=${slug}`);
  };

  return (
    <>
      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        {sekmeler.map((tab) => {
          const active = sekme === tab.slug;
          return (
            <button
              type="button"
              key={tab.slug}
              onClick={() => sec(tab.slug)}
              aria-pressed={active}
              className={`rounded-3xl border p-3 text-left transition-colors sm:p-6 ${active
                ? "border-brand-gold/60 bg-brand-gold/[0.08]"
                : "border-white/10 bg-brand-slate hover:border-white/20"
                }`}
            >
              <div className="flex items-start justify-between gap-1 text-xs leading-tight text-brand-muted sm:items-center sm:text-sm">
                <span>{tab.label}</span>
                {active && <span className="h-2 w-2 rounded-full bg-brand-gold" />}
              </div>
              <p className={`mt-2 font-display text-2xl font-extrabold sm:mt-4 sm:text-4xl ${active ? "text-brand-gold" : "text-brand-text"}`}>
                {tab.count}
              </p>
            </button>
          );
        })}
      </section>

      <section id="randevular" className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6">
        <p className="text-sm font-semibold text-brand-gold">Randevular</p>
        <p className="mt-1 font-display text-xl font-extrabold text-brand-text [font-stretch:112%]">Gelen randevular</p>
        {bildirim}
        <div className="mt-6">
          {sekme === "takvim" ? (
            <RandevuCalendar randevular={aktifler} hizmetler={hizmetler} onCancel={onCancel} />
          ) : (
            <RandevuList
              randevular={sekme === "aktif" ? aktifler : iptaller}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          )}
        </div>
      </section>
    </>
  );
}
