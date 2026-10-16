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

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {randevular.map((randevu) => (
                <div
                    key={randevu.id}
                    className={`group relative overflow-hidden rounded-3xl border transition-colors ${randevu.durum === "iptal"
                        ? "border-red-500/40 bg-red-500/10"
                        : "border-white/10 bg-brand-slate hover:border-white/20"
                        }`}
                >
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs uppercase tracking-[0.2em] text-brand-muted">
                                    {randevu.tarih}
                                </span>
                                <span className="mt-1 text-2xl font-black text-brand-gold">
                                    {randevu.saat}
                                </span>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${randevu.durum === "iptal"
                                    ? "bg-red-500/20 text-red-100"
                                    : "bg-emerald-500/20 text-emerald-100"
                                    }`}
                            >
                                {randevu.durum === "iptal" ? "İptal" : "Aktif"}
                            </span>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-brand-text leading-tight">
                                    {randevu.ad}
                                </h3>
                                <p className="text-sm text-brand-muted">{randevu.hizmet}</p>
                                {paketAciklamasi(randevu) ? (
                                    <p className="text-sm text-brand-muted">{paketAciklamasi(randevu)}</p>
                                ) : null}
                                {randevu.fiyat ? (
                                    <p className="mt-1 text-base font-black text-brand-gold">{formatTL(randevu.fiyat)}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2 border-t border-white/10 pt-4">
                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <span>📞</span>
                                    <span>{randevu.telefon}</span>
                                </div>
                                {randevu.sendika && (
                                    <div className="flex items-center gap-3 text-sm text-white/70">
                                        <span>🏷️</span>
                                        <span className={isAnlasmaliSendika(randevu.sendika) ? "font-semibold text-brand-gold" : ""}>
                                            {randevu.sendika}
                                        </span>
                                    </div>
                                )}
                                {randevu.plaka && (
                                    <div className="flex items-center gap-3 text-sm text-white/70">
                                        <span>🚗</span>
                                        <span>{randevu.plaka}</span>
                                    </div>
                                )}
                                {randevu.email && (
                                    <div className="flex items-center gap-3 text-sm text-white/70">
                                        <span>📧</span>
                                        <span className="truncate">{randevu.email}</span>
                                    </div>
                                )}
                            </div>

                            {randevu.not_metni && (
                                <div className="rounded-xl bg-white/5 p-3">
                                    <p className="text-xs italic text-brand-muted leading-relaxed">
                                        <span className="whitespace-pre-line">{randevu.not_metni}</span>
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 mt-4">
                                {randevu.durum !== "iptal" && (
                                    <button
                                        onClick={() => {
                                            if (confirm("Bu randevuyu iptal etmek istiyor musun?")) {
                                                onCancel(randevu.id);
                                            }
                                        }}
                                        className="w-full rounded-full border border-red-500/30 py-3 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
                                    >
                                        Randevuyu İptal Et
                                    </button>
                                )}

                                {randevu.durum === "iptal" && (
                                    <button
                                        onClick={() => {
                                            if (confirm("Bu randevuyu KALICI olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
                                                onDelete(randevu.id);
                                            }
                                        }}
                                        className="w-full rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-brand-text transition-all hover:-translate-y-0.5 hover:bg-red-700 active:scale-95"
                                    >
                                        Randevuyu Tamamen Sil
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
