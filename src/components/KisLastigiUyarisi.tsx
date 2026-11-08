"use client";

import { useState } from "react";

// Malatya kış lastiği zorunluluğu: 15 Kasım 2026 – 15 Nisan 2027.
// Dönem bittikten sonra uyarı kendiliğinden gizlenir.
const DONEM_SONU = "2027-04-15";

export default function KisLastigiUyarisi({ bugun }: { bugun: string }) {
  const [acik, setAcik] = useState(true);
  if (!acik || bugun > DONEM_SONU) return null;

  return (
    <div
      role="alert"
      className="relative mx-auto mt-4 flex max-w-2xl items-start gap-3 rounded-2xl border border-sky-300/40 bg-sky-500/10 p-3 pr-11 text-left sm:mt-6 sm:p-4 sm:pr-12 lg:mx-0"
    >
      <span className="mt-0.5 shrink-0 text-xl leading-none" aria-hidden="true">
        ❄️
      </span>
      <div>
        <p className="text-sm font-bold text-white">Kış lastiği zorunluluğu</p>
        <p className="mt-1 text-sm leading-relaxed text-white/80">
          Malatya&apos;da kış lastiği zorunluluğu <strong className="text-white">15 Kasım 2026</strong> ile{" "}
          <strong className="text-white">15 Nisan 2027</strong> tarihleri arasında geçerlidir.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setAcik(false)}
        aria-label="Uyarıyı kapat"
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
        </svg>
      </button>
    </div>
  );
}
