import Image from "next/image";
import Link from "next/link";

const menu = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hizmetlerimiz", href: "/hizmetler" },
  { label: "Ürünler", href: "/urunler" }
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-md">
      <div className="flex w-full flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:flex-nowrap">
        <Link href="/" className="flex items-center pl-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            alt="Fırat Oto Lastik logo"
            width={260}
            height={80}
            className="h-20 w-auto object-contain"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        <nav className="flex items-center gap-8 text-base font-black text-white tracking-widest uppercase">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-brand-gold hover:scale-105"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/lastik-sorgula"
            className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-brand-gold hover:scale-105"
          >
            Sorgula
          </Link>
          <div className="group relative">
            <Link
              href="/randevu"
              className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-brand-gold hover:scale-105"
            >
              Randevu
            </Link>
            <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <span className="absolute -top-3 left-0 right-0 h-3 bg-transparent" />
              <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-x-transparent border-b-[6px] border-b-brand-gold" />
              <div className="relative rounded-xl border border-brand-gold/50 bg-[#0f172a]/95 backdrop-blur-xl px-2 py-1 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-center gap-3 text-[13px] font-black text-white">
                  <Link
                    href="/randevu"
                    className="whitespace-nowrap px-2 py-1 transition-all hover:scale-110 hover:text-brand-gold"
                  >
                    Randevu Al
                  </Link>
                  <span className="text-brand-gold/40">/</span>
                  <Link
                    href="/randevu-sorgula"
                    className="whitespace-nowrap px-2 py-1 transition-all hover:scale-110 hover:text-brand-gold"
                  >
                    Randevu Sorgula
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-4 text-base font-semibold text-white">
          <a
            href="tel:+905387061065"
            className="flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 hover:text-brand-gold"
            aria-label="Telefon ile ara"
          >
            <PhoneIcon />
            0 538 706 10 65
          </a>
          <a
            href="https://wa.me/905387061065?text=Merhaba"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 hover:text-brand-gold"
            aria-label="WhatsApp ile mesaj gönder"
          >
            <Image
              src="/wp.svg"
              alt="WhatsApp"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            0 538 706 10 65
          </a>
        </div>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-gold">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.55.57 1 1 0 0 1 1 1v3.59a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-.25 1.02z"
      />
    </svg>
  );
}
