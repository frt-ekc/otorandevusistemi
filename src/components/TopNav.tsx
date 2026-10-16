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
  const [isRandevuOpen, setIsRandevuOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setIsRandevuOpen(false);
    }
  }, [isOpen]);

  return (
    <>
      <header className={`sticky top-0 transition-all duration-300 ${isOpen ? "z-[70] bg-brand-dark" : "z-50 bg-brand-dark/75 backdrop-blur-md"
        } border-b border-white/[0.07]`}>
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

          {/* MASAÜSTÜ NAVİGASYON */}
          <nav className="hidden items-center gap-8 text-[15px] font-semibold text-brand-text/85 lg:flex">
            {menu.map((item) => (
              <Link key={item.label} href={item.href} className="group/roll">
                <RollText>{item.label}</RollText>
              </Link>
            ))}

            <div className="group relative">
              <Link href="/randevu" className="group/roll flex items-center gap-1.5 transition-colors group-hover:text-brand-gold">
                <RollText>Randevu</RollText>
                <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Link>
              <div className="pointer-events-none absolute left-1/2 top-full pt-4 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="relative rounded-xl border border-white/10 bg-brand-slate/95 backdrop-blur-xl px-4 py-2 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {/* Dropdown Arrow */}
                  <div className="absolute -top-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-brand-slate" />

                  <div className="relative z-10 flex items-center justify-center gap-3 text-sm font-semibold text-white whitespace-nowrap">
                    <Link
                      href="/randevu"
                      className="transition-all hover:scale-110 hover:text-brand-gold"
                    >
                      Randevu Al
                    </Link>
                    <span className="text-brand-gold/40">/</span>
                    <Link
                      href="/randevu-sorgula"
                      className="transition-all hover:scale-110 hover:text-brand-gold"
                    >
                      Randevu Sorgula
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* MASAÜSTÜ SAĞ TARAF */}
          <div className="hidden items-center gap-3 lg:flex">
            <a href="tel:+905387061065" className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-brand-text/85 hover:text-brand-gold transition-colors">
              <PhoneIcon className="h-4 w-4 text-brand-gold" />
              0538 706 10 65
            </a>
            <Link href="/randevu" className="rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5">
              Randevu al
            </Link>
          </div>

          {/* MOBİL BUTONLAR */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="https://wa.me/905387061065"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-brand-gold active:scale-90 shadow-lg shadow-black/20 border border-white/5"
              aria-label="WhatsApp"
            >
              <Image src="/wp.svg" alt="WA" width={22} height={22} />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative z-[100] flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 active:scale-90 shadow-lg shadow-black/20 border border-white/5 transition-colors ${isOpen ? "text-rose-500" : "text-white"
                }`}
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
        </div>
      </header>

      {/* MOBİL MENÜ MODAL - DAHA KÜÇÜK VE DERLİ TOPLU */}
      <div
        className={`fixed inset-0 z-[60] h-screen w-screen bg-brand-dark transition-all duration-300 ease-in-out lg:hidden ${isOpen ? "visible opacity-100" : "invisible opacity-0 translate-x-12"
          }`}
      >
        <div className="flex h-full flex-col px-6 pb-10 pt-20 text-center overflow-y-auto">
          <nav className="flex flex-col space-y-2 mt-4">
            {menu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-4 font-display text-lg font-bold text-brand-text transition-all active:bg-brand-gold active:text-brand-dark active:scale-[0.98]"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobil Randevu Accordion */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setIsRandevuOpen(!isRandevuOpen)}
                className={`flex w-full items-center justify-center gap-3 py-4 rounded-xl border border-white/5 transition-all active:scale-[0.98] ${isRandevuOpen ? "bg-white/10 text-brand-gold border-brand-gold/30" : "bg-white/5 text-white"
                  }`}
              >
                <span className="ml-8 font-display text-lg font-bold">Randevu</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isRandevuOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`flex flex-col space-y-1 overflow-hidden transition-all duration-300 ${isRandevuOpen ? "max-h-[200px] opacity-100 py-1" : "max-h-0 opacity-0"}`}>
                <Link
                  href="/randevu"
                  onClick={() => { setIsOpen(false); setIsRandevuOpen(false); }}
                  className="mx-2 rounded-xl bg-white/5 py-3.5 text-base font-semibold text-white/85 transition-all active:bg-brand-gold active:text-brand-dark"
                >
                  Randevu Al
                </Link>
                <Link
                  href="/randevu-sorgula"
                  onClick={() => { setIsOpen(false); setIsRandevuOpen(false); }}
                  className="mx-2 rounded-xl bg-white/5 py-3.5 text-base font-semibold text-white/85 transition-all active:bg-brand-gold active:text-brand-dark"
                >
                  Randevu Sorgula
                </Link>
              </div>
            </div>
          </nav>

          <div className="mt-12 flex flex-col gap-3">
            <div className="mb-1 text-sm font-semibold text-brand-muted">Bize ulaşın</div>
            <a href="tel:+905387061065" className="flex items-center justify-center gap-4 rounded-2xl bg-white/5 py-4 text-base font-black text-white active:bg-white/10 transition-all">
              <PhoneIcon className="h-5 w-5 text-brand-gold" />
              0538 706 10 65
            </a>
            <a href="https://wa.me/905387061065" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-xl shadow-[#25D366]/20 active:scale-[0.98] transition-all">
              <Image src="/wp.svg" alt="WA" width={22} height={22} className="brightness-200" />
              WhatsApp&apos;tan yazın
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Üzerine gelince yazı yukarı kayar, altından sarı kopyası gelir.
function RollText({ children }: { children: string }) {
  const ease = "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";
  return (
    <span className="relative block overflow-hidden">
      <span className={`block ${ease} group-hover/roll:-translate-y-full`}>{children}</span>
      <span aria-hidden="true" className={`absolute inset-0 block translate-y-full text-brand-gold ${ease} group-hover/roll:translate-y-0`}>
        {children}
      </span>
    </span>
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

function ChevronDownIcon({ className = "h-5 w-5" }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
