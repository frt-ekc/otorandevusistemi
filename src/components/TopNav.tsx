"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const menu = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hizmetlerimiz", href: "/hizmetler" },
  { label: "Ürünler", href: "/urunler" }
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            alt="Fırat Oto Lastik logo"
            width={180}
            height={40}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-black tracking-widest text-white uppercase lg:flex xl:gap-8">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-brand-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/lastik-sorgula" className="transition hover:text-brand-gold">
            Sorgula
          </Link>
          <div className="group relative">
            <Link href="/randevu" className="transition hover:text-brand-gold">
              Randevu
            </Link>
            <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="relative rounded-xl border border-brand-gold/50 bg-[#0f172a]/95 p-1 shadow-2xl">
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <Link href="/randevu" className="rounded-lg px-4 py-2 text-xs hover:bg-white/5 hover:text-brand-gold">
                    Randevu Al
                  </Link>
                  <Link href="/randevu-sorgula" className="rounded-lg px-4 py-2 text-xs hover:bg-white/5 hover:text-brand-gold">
                    Randevu Sorgula
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <a href="tel:+905387061065" className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-gold">
            <PhoneIcon />
            0 538 706 10 65
          </a>
          <a href="https://wa.me/905387061065" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-brand-gold/10 px-4 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold/20">
            <Image src="/wp.svg" alt="WA" width={16} height={16} />
            Hemen Yazın
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white lg:hidden"
          aria-label="Menüyü aç"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[65px] z-50 flex flex-col bg-[#0f172a] p-6 lg:hidden">
          <nav className="flex flex-col gap-4 text-xl font-bold text-white uppercase tracking-wider">
            {menu.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setIsOpen(false)} className="border-b border-white/5 py-4 hover:text-brand-gold">
                {item.label}
              </Link>
            ))}
            <Link href="/lastik-sorgula" onClick={() => setIsOpen(false)} className="border-b border-white/5 py-4 hover:text-brand-gold">
              Lastik Sorgula
            </Link>
            <Link href="/randevu" onClick={() => setIsOpen(false)} className="border-b border-white/5 py-4 hover:text-brand-gold text-brand-gold">
              Randevu Al
            </Link>
            <Link href="/randevu-sorgula" onClick={() => setIsOpen(false)} className="border-b border-white/5 py-4 hover:text-brand-gold">
              Randevu Sorgula
            </Link>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <a href="tel:+905387061065" className="flex items-center justify-center gap-3 rounded-2xl bg-white/5 py-5 text-lg font-bold text-white">
              <PhoneIcon /> 0 538 706 10 65
            </a>
            <a href="https://wa.me/905387061065" className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-5 text-lg font-bold text-white shadow-xl">
              <Image src="/wp.svg" alt="WA" width={24} height={24} className="brightness-200" /> WhatsApp'tan Yazın
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-gold">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.55.57 1 1 0 0 1 1 1v3.59a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-.25 1.02z"
      />
    </svg>
  );
}
