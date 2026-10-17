"use client";

import { isAnlasmaliSendika } from "@/lib/sendikalar";
import { formatTL, paketAciklamasi } from "@/lib/lastikPaketleri";

type Randevu = {
    id: string;
    ad: string;
    telefon: string;
    email: string | null;
    plaka: string | null;
    sendika?: string | null;
    arac_turu?: string | null;
    lastik_adedi?: number | null;
    balans_adedi?: number | null;
    fiyat?: number | null;
    hizmet: string;
    tarih: string;
    saat: string;
    not_metni: string | null;
    durum: string;
};

type Props = {
    randevular: Randevu[];
    onCancel: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
};

export default function RandevuList({ randevular, onCancel, onDelete }: Props) {
    if (randevular.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-brand-slate py-20 text-center">
                <p className="text-4xl">📅</p>
                <p className="mt-4 text-brand-muted italic">Henüz bu kategoride randevu bulunmuyor.</p>
            </div>
        );
    }

    // En erken tarih ve saat en üstte; aynı günün randevuları tek başlık altında
    const sirali = [...randevular].sort((a, b) =>
        `${a.tarih} ${saatKisa(a.saat)}`.localeCompare(`${b.tarih} ${saatKisa(b.saat)}`)
    );
    const gunler: { tarih: string; randevular: Randevu[] }[] = [];
    for (const r of sirali) {
        const son = gunler[gunler.length - 1];
        if (son && son.tarih === r.tarih) son.randevular.push(r);
        else gunler.push({ tarih: r.tarih, randevular: [r] });
    }

    return (
        <div className="space-y-6">
            {gunler.map((gun) => (
                <section key={gun.tarih}>
                    <h3 className="mb-2 flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                        <span className="font-bold text-brand-text">{gunBasligi(gun.tarih)}</span>
                        <span className="text-xs text-brand-muted">{gun.randevular.length} randevu</span>
                    </h3>
                    <ul className="divide-y divide-white/5">
                        {gun.randevular.map((randevu) => {
                            const iptal = randevu.durum === "iptal";
                            const paket = paketAciklamasi(randevu);
                            return (
                                <li
                                    key={randevu.id}
                                    className={`grid gap-x-4 gap-y-1 px-2 py-3 sm:grid-cols-[4rem_1fr_auto] sm:items-center ${
                                        iptal ? "opacity-70" : ""
                                    }`}
                                >
                                    <span
                                        className={`font-display text-lg font-extrabold tabular-nums ${
                                            iptal ? "text-red-300 line-through" : "text-brand-gold"
                                        }`}
                                    >
                                        {saatKisa(randevu.saat)}
                                    </span>

                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                                            <span className="font-bold text-brand-text">{randevu.ad}</span>
                                            <a href={`tel:${randevu.telefon}`} className="text-sm text-white/70 hover:text-brand-gold">
                                                {randevu.telefon}
                                            </a>
                                            {iptal ? (
                                                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-200">
                                                    İptal
                                                </span>
                                            ) : null}
                                        </p>
                                        <p className="text-sm text-brand-muted">
                                            {[randevu.hizmet, paket].filter(Boolean).join(" · ")}
                                            {randevu.fiyat ? (
                                                <span className="font-semibold text-brand-text"> · {formatTL(randevu.fiyat)}</span>
                                            ) : null}
                                        </p>
                                        {randevu.sendika || randevu.plaka || randevu.email ? (
                                            <p className="text-xs text-white/50">
                                                {randevu.sendika ? (
                                                    <span className={isAnlasmaliSendika(randevu.sendika) ? "text-brand-gold/80" : ""}>
                                                        {randevu.sendika}
                                                    </span>
                                                ) : null}
                                                {[randevu.plaka, randevu.email].filter(Boolean).map((v) => ` · ${v}`)}
                                            </p>
                                        ) : null}
                                        {randevu.not_metni ? (
                                            <p className="mt-1 whitespace-pre-line text-xs italic text-white/50">{randevu.not_metni}</p>
                                        ) : null}
                                    </div>

                                    <div className="mt-2 sm:mt-0">
                                        {!iptal ? (
                                            <button
                                                onClick={() => {
                                                    if (confirm("Bu randevuyu iptal etmek istiyor musun?")) {
                                                        onCancel(randevu.id);
                                                    }
                                                }}
                                                className="rounded-full border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10"
                                            >
                                                İptal et
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (confirm("Bu randevuyu KALICI olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
                                                        onDelete(randevu.id);
                                                    }
                                                }}
                                                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
                                            >
                                                Tamamen sil
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
        </div>
    );
}

// "09:30:00" -> "09:30"
function saatKisa(saat: string) {
    return String(saat ?? "").slice(0, 5);
}

// "2026-10-20" -> "20 Ekim 2026 Salı"
function gunBasligi(tarih: string) {
    const [y, m, d] = tarih.split("-").map(Number);
    if (!y || !m || !d) return tarih;
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: "UTC",
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long"
    }).format(new Date(Date.UTC(y, m - 1, d)));
}
