"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const menu = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hizmetlerimiz", href: "/hizmetler" },
  { label: "Ürünler", href: "/urunler" }
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Menü açıkken sayfanın kaymasını engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center transition-transform active:scale-95">
          <Image
            src="/logo.svg"
            alt="Fırat Oto Lastik logo"
            width={160}
            height={40}
            className="h-8 w-auto object-contain sm:h-10"
            priority
          />
        </Link>

        {/* Masaüstü Navigasyon */}
        <nav className="hidden items-center gap-6 text-[13px] font-black tracking-[0.2em] text-white/90 uppercase lg:flex">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-brand-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/lastik-sorgula" className="transition-colors hover:text-brand-gold">
            Sorgula
          </Link>
          <div className="group relative">
            <Link href="/randevu" className="transition-colors hover:text-brand-gold">
              Randevu
            </Link>
            <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="rounded-xl border border-white/10 bg-[#0f172a]/95 p-1 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <Link href="/randevu" className="rounded-lg px-4 py-3 text-xs tracking-widest hover:bg-white/5 hover:text-brand-gold">
                    Randevu Al
                  </Link>
                  <Link href="/randevu-sorgula" className="rounded-lg px-4 py-3 text-xs tracking-widest hover:bg-white/5 hover:text-brand-gold">
                    Randevu Sorgula
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Masaüstü CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <a href="tel:+905387061065" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white hover:border-brand-gold/30 hover:text-brand-gold">
            <PhoneIcon className="h-4 w-4" />
            0 538 706 10 65
          </a>
        </div>

        {/* Mobil Menü Butonu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white active:scale-90 lg:hidden"
          aria-label="Menü"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobil Menü Katmanı (Overlay) */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden bg-[#0f172a] transition-all duration-500 ease-in-out lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
      >
        <div className="flex flex-col h-full px-6 pb-12 pt-24">
          <nav className="flex flex-col space-y-2">
            {[...menu, { label: "Lastik Sorgula", href: "/lastik-sorgula" }].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-white/5 px-6 py-5 text-lg font-black uppercase tracking-widest text-white/90 active:bg-white/5 active:text-brand-gold"
              >
                {item.label}
                <span className="text-brand-gold">→</span>
              </Link>
            ))}

            <Link
              href="/randevu"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-brand-gold px-6 py-6 text-lg font-black uppercase tracking-widest text-brand-dark shadow-lg shadow-brand-gold/20"
            >
              Randevu Al
              <span className="text-2xl">+</span>
            </Link>
            <Link
              href="/randevu-sorgula"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-white/40"
            >
              Randevu Durumu Sorgula
            </Link>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <div className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-center text-white/20">
              Hızlı İletişim
            </div>
            <a href="tel:+905387061065" className="flex items-center justify-center gap-4 rounded-2xl bg-white/5 py-5 text-base font-black text-white hover:bg-white/10 active:scale-95 transition-transform">
              <PhoneIcon className="h-5 w-5 text-brand-gold" />
              0538 706 10 65
            </a>
            <a href="https://wa.me/905387061065" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-5 text-base font-black text-white shadow-xl active:scale-95 transition-transform">
              <Image src="/wp.svg" alt="WA" width={22} height={22} className="brightness-200" />
              WHATSAPP DESTEK
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function PhoneIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-.25 1.02z"
      />
    </svg>
  );
}
