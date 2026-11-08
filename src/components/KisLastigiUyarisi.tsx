"use client";

import { useEffect, useState } from "react";
import { INTRO_KEY } from "@/components/site/SiteIntro";

// Malatya kış lastiği zorunluluğu: 15 Kasım 2026 – 15 Nisan 2027.
// Randevu sayfası açılınca ekranın ortasında açılır pencere olarak çıkar;
// ilk girişte açılış animasyonu bittikten sonra görünür. Dönem bitince hiç çıkmaz.
const DONEM_SONU = "2027-04-15";
const ANIMASYON_MS = 2700;

export default function KisLastigiUyarisi({ bugun }: { bugun: string }) {
  const [acik, setAcik] = useState(false);

  useEffect(() => {
    if (bugun > DONEM_SONU) return;
    // Animasyon bu oturumda zaten oynadıysa hemen, oynamadıysa bitince aç
    let animasyonGorulmus = document.documentElement.hasAttribute("data-intro-seen");
    try {
      animasyonGorulmus = animasyonGorulmus || sessionStorage.getItem(INTRO_KEY) !== null;
    } catch {}
    const t = setTimeout(() => setAcik(true), animasyonGorulmus ? 0 : ANIMASYON_MS);
    return () => clearTimeout(t);
  }, [bugun]);

  useEffect(() => {
    if (!acik) return;
    const kapatEsc = (e: KeyboardEvent) => e.key === "Escape" && setAcik(false);
    window.addEventListener("keydown", kapatEsc);
    const eskiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", kapatEsc);
      document.body.style.overflow = eskiTasma;
    };
  }, [acik]);

  if (!acik) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setAcik(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kis-lastigi-baslik"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-sky-300/30 bg-brand-slate p-6 pr-12 text-left shadow-2xl sm:p-8 sm:pr-14"
      >
        <button
          type="button"
          onClick={() => setAcik(false)}
          aria-label="Uyarıyı kapat"
          autoFocus
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-2xl" aria-hidden="true">
          ❄️
        </div>
        <h2 id="kis-lastigi-baslik" className="mt-4 text-xl font-black text-white sm:text-2xl">
          Müşterilerimizin Dikkatine
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          Malatya&apos;da kış lastiği zorunluluğu <strong className="text-white">15 Kasım 2026</strong> itibarıyla
          başlıyor ve <strong className="text-white">15 Nisan 2027</strong> tarihine kadar sürüyor.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          15 Kasım&apos;dan itibaren kış lastiği takılı olmayan araçlara trafik denetimlerinde{" "}
          <strong className="text-white">idari para cezası</strong> uygulanmaktadır.
        </p>
      </div>
    </div>
  );
}
