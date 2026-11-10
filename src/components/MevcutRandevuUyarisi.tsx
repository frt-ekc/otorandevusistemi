"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { randevuIptalEt } from "@/app/(public)/randevu-sorgula/actions";
import type { MevcutRandevu } from "@/app/(public)/randevu/actions";

export type { MevcutRandevu };

const anahtar = (r: MevcutRandevu) => `${r.tarih} ${r.saat}`;

type Props = {
  randevular: MevcutRandevu[];
  ad: string;
  telefon: string;
  // Müşteri ya eski randevusunu iptal etti ya da iptal etmeden devam etmeyi seçti
  onDevam: () => void;
  onKapat: () => void;
};

// "2026-11-11" → "11 Kasım 2026 Çarşamba"
export function tarihYazisi(tarih: string) {
  const [y, m, d] = tarih.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC"
  });
}

// Aynı telefonla zaten aktif randevu varken yeni randevu alınmak istenirse çıkan pencere
export default function MevcutRandevuUyarisi({ randevular, ad, telefon, onDevam, onKapat }: Props) {
  const [kalanlar, setKalanlar] = useState(randevular);
  const [iptalEdilen, setIptalEdilen] = useState(0);
  const [hata, setHata] = useState<string | null>(null);
  const [bekleyen, setBekleyen] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const kapatEsc = (e: KeyboardEvent) => e.key === "Escape" && !pending && onKapat();
    window.addEventListener("keydown", kapatEsc);
    const eskiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", kapatEsc);
      document.body.style.overflow = eskiTasma;
    };
  }, [onKapat, pending]);

  const iptalEt = (r: MevcutRandevu) => {
    const id = r.id;
    if (!id) return; // başka ad ile alınmış randevu buradan iptal edilemez
    setHata(null);
    setBekleyen(anahtar(r));
    startTransition(async () => {
      const sonuc = await randevuIptalEt(id, ad, telefon);
      setBekleyen(null);
      if (!sonuc.ok) {
        setHata(sonuc.message ?? "İptal edilemedi. Lütfen bizi arayın.");
        return;
      }
      const yeni = kalanlar.filter((k) => anahtar(k) !== anahtar(r));
      setKalanlar(yeni);
      setIptalEdilen((n) => n + 1);
      // Hepsi iptal edildiyse doğrudan yeni randevuya geç
      if (yeni.length === 0) onDevam();
    });
  };

  const tek = kalanlar.length === 1 ? kalanlar[0] : null;

  // Formun üst kaplarındaki bulanıklık (backdrop-blur) "fixed" konumu bozar; pencere doğrudan body'ye çizilir
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => !pending && onKapat()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mevcut-randevu-baslik"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-brand-gold/30 bg-brand-slate p-6 text-left shadow-2xl sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/15 text-2xl" aria-hidden="true">
          📅
        </div>
        <h2 id="mevcut-randevu-baslik" className="mt-4 text-xl font-black text-white sm:text-2xl">
          {iptalEdilen > 0
            ? "Randevunuz iptal edildi"
            : kalanlar.some((r) => r.adEslesiyor)
              ? "Zaten bir randevunuz var"
              : "Bu numarayla bir randevu var"}
        </h2>

        {tek && tek.adEslesiyor ? (
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            <strong className="text-white">{tarihYazisi(tek.tarih)}</strong> günü saat{" "}
            <strong className="text-white">{tek.saat}</strong>&apos;da {tek.hizmet.toLocaleLowerCase("tr-TR")} randevunuz
            bulunuyor. Bu randevuyu iptal edip yeni randevu almak ister misiniz?
          </p>
        ) : tek ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Bu telefon numarasıyla <strong className="text-white">{tarihYazisi(tek.tarih)}</strong> günü saat{" "}
              <strong className="text-white">{tek.saat}</strong>&apos;da başka bir ad ile alınmış bir randevu bulunuyor.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              O randevuyu iptal etmek isterseniz, randevuyu alan kişinin adıyla{" "}
              <a href="/randevu-sorgula" className="font-bold text-brand-gold underline underline-offset-2">
                Randevu Sorgula / İptal
              </a>{" "}
              sayfasından iptal edebilirsiniz.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Bu telefon numarasıyla aşağıdaki randevular bulunuyor. İptal etmek istediğinizi seçebilirsiniz.
            </p>
            <ul className="mt-4 grid gap-2">
              {kalanlar.map((r) => (
                <li
                  key={anahtar(r)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-sm">
                    <p className="font-bold text-white">{tarihYazisi(r.tarih)}</p>
                    <p className="text-white/60">
                      Saat {r.saat} · {r.hizmet}
                    </p>
                  </div>
                  {r.adEslesiyor ? (
                    <button
                      type="button"
                      onClick={() => iptalEt(r)}
                      disabled={pending}
                      className="shrink-0 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-50"
                    >
                      {bekleyen === anahtar(r) ? "İptal ediliyor..." : "İptal et"}
                    </button>
                  ) : (
                    <span className="shrink-0 text-right text-xs text-white/50">Başka ad ile alınmış</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {hata ? <p className="mt-3 text-sm text-rose-200">{hata}</p> : null}

        <div className="mt-6 grid gap-3">
          {tek && tek.adEslesiyor ? (
            <button
              type="button"
              onClick={() => iptalEt(tek)}
              disabled={pending}
              autoFocus
              className="rounded-full bg-rose-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              {pending ? "İptal ediliyor..." : "Evet, bu randevuyu iptal et ve yeni randevu al"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDevam}
            disabled={pending}
            className="rounded-full border border-brand-gold/50 px-5 py-3.5 text-sm font-bold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-50"
          >
            {iptalEdilen > 0 ? "Yeni randevuya devam et" : "İptal etmeden randevu al (yakınım için)"}
          </button>
          <button
            type="button"
            onClick={onKapat}
            disabled={pending}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white/60 hover:text-white disabled:opacity-50"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
