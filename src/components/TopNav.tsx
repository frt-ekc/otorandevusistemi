"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const menu = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hizmetlerimiz", href: "/hizmetler" },
  { label: "Ürünler", href: "/urunler" },
  { label: "Sorgula", href: "/lastik-sorgula" }
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center transition-transform active:scale-95">
          <Image
            src="/logo.svg"
            alt="Fırat Oto Lastik logo"
            width={160}
            height={40}
            className="h-9 w-auto object-contain sm:h-11"
            priority
          />
        </Link>

        {/* Masaüstü Navigasyon */}
        <nav className="hidden items-center gap-8 text-[13px] font-black tracking-[0.2em] text-white/90 uppercase lg:flex">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-brand-gold"
            >
              {item.label}
            </Link>
          ))}

          <div className="group relative">
            <Link href="/randevu" className="flex items-center gap-1 transition-colors hover:text-brand-gold">
              Randevu <span className="text-[10px] text-brand-gold">▼</span>
            </Link>
            {/* Masaüstü Alt Menü */}
            <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="rounded-xl border border-white/10 bg-brand-night/95 p-2 shadow-2xl backdrop-blur-xl">
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

        {/* Masaüstü Sağ Taraf */}
        <div className="hidden items-center gap-3 lg:flex">
          <a href="tel:+905387061065" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white hover:border-brand-gold/30 hover:text-brand-gold transition-all">
            <PhoneIcon className="h-4 w-4 text-brand-gold" />
            0 538 706 10 65
          </a>
          <a href="https://wa.me/905387061065" target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-full bg-white/5 p-2 border border-white/10 hover:border-green-500/50 transition-all active:scale-90">
            <Image src="/wp.svg" alt="WhatsApp" width={18} height={18} />
          </a>
        </div>

        {/* Mobil Menü Butonu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-[70] flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white active:scale-90 lg:hidden"
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

      {/* MOBİL MENÜ - ARKA PLAN KESİNLİKLE OPAK (KARIŞIKLIĞI GİDERİCİ) */}
      <div
        className={`fixed inset-0 z-[60] bg-[#0c121e] transition-all duration-500 ease-in-out lg:hidden ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
      >
        <div className="flex flex-col h-full px-8 pb-12 pt-28 text-center bg-[#0c121e]">
          <nav className="flex flex-col space-y-6">
            {menu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-black uppercase tracking-[0.2em] text-white active:text-brand-gold"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/randevu"
              onClick={() => setIsOpen(false)}
              className="text-2xl font-black uppercase tracking-[0.2em] text-brand-gold"
            >
              Randevu Al
            </Link>
            <Link
              href="/randevu-sorgula"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold uppercase tracking-[0.2em] text-white/30"
            >
              Randevu Sorgulama
            </Link>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mb-2">Destek ve İletişim</div>
            <a href="tel:+905387061065" className="flex items-center justify-center gap-4 rounded-2xl bg-white/5 py-5 text-base font-black text-white">
              <PhoneIcon className="h-6 w-6 text-brand-gold" />
              0538 706 10 65
            </a>
            <a href="https://wa.me/905387061065" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 rounded-2xl bg-green-600 py-5 text-base font-black text-white shadow-xl shadow-green-600/20">
              <Image src="/wp.svg" alt="WA" width={24} height={24} className="brightness-200" />
              WHATSAPP'TAN YAZIN
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
