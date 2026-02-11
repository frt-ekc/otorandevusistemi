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
        <div className="flex items-center pl-2">
          <Image
            src="/logo.svg"
            alt="Fırat Oto Lastik logo"
            width={260}
            height={80}
            className="h-20 w-auto object-contain"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>

        <nav className="flex items-center gap-8 text-base font-semibold text-white tracking-wide">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-white hover:underline hover:decoration-brand-gold hover:decoration-2 hover:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/lastik-sorgula"
            className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-white hover:underline hover:decoration-brand-gold hover:decoration-2 hover:underline-offset-8"
          >
            Sorgula
          </Link>
          <div className="group relative">
            <Link
              href="/randevu"
              className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-white hover:underline hover:decoration-brand-gold hover:decoration-2 hover:underline-offset-8"
            >
              Randevu
            </Link>
            <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <span className="absolute -top-3 left-0 right-0 h-3 bg-transparent" />
              <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-[#d7d7d9]" />
              <div className="relative min-w-[260px] rounded-md border border-black/10 bg-[#d7d7d9] px-3 py-1 shadow-soft">
                <div className="flex items-center justify-center gap-3 text-[14px] font-semibold text-[#2e2e2e] tracking-wide">
                  <Link
                    href="/randevu"
                    className="whitespace-nowrap rounded-md px-2.5 py-0.5 transition-transform duration-150 hover:scale-105"
                  >
                    Randevu Al
                  </Link>
                  <span className="text-[#7a7a7a]">|</span>
                  <Link
                    href="/randevu-sorgula"
                    className="whitespace-nowrap rounded-md px-2.5 py-0.5 transition-transform duration-150 hover:scale-105"
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
