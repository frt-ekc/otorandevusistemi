import Image from "next/image";
import Link from "next/link";
import type { AyarlarRow } from "@/lib/db";
import { ADRES_VARSAYILAN, TELEFON_GORUNEN, TELEFON_LINK, WHATSAPP_LINK } from "./contact";

const menu = [
  { label: "Randevu al", href: "/randevu" },
  { label: "Randevumu sorgula", href: "/randevu-sorgula" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Ürünler", href: "/urunler" },
  { label: "Lastik stok sorgula", href: "/lastik-sorgula" }
];

export default function SiteFooter({ ayarlar }: { ayarlar?: AyarlarRow | null }) {
  return (
    <footer className="border-t border-white/10 bg-[#100F0E] pb-28 pt-14 sm:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Image src="/logo.svg" alt="Fırat Oto Lastik" width={170} height={42} className="h-10 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-muted">
            Malatya Battalgazi&apos;de lastik değişimi, balans ve lastik tamiri. Anlaşmalı sendika üyelerine özel fiyatlar.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-brand-text">Sayfalar</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-muted">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="transition-colors hover:text-brand-gold">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-brand-text">Çalışma saatleri</h3>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-brand-muted">Hafta içi</dt><dd>{ayarlar?.hafta_ici ?? "09:00 - 18:00"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-brand-muted">Cumartesi</dt><dd>{ayarlar?.cumartesi ?? "09:00 - 16:00"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-brand-muted">Pazar</dt><dd>{ayarlar?.pazar ?? "Kapalı"}</dd></div>
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-bold text-brand-text">İletişim</h3>
          <p className="mt-4 text-sm leading-relaxed text-brand-muted">{ayarlar?.adres ?? ADRES_VARSAYILAN}</p>
          <a href={TELEFON_LINK} className="mt-3 block font-display text-xl font-extrabold text-brand-gold">
            {ayarlar?.telefon ?? TELEFON_GORUNEN}
          </a>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-muted underline-offset-4 hover:text-brand-text hover:underline">
            WhatsApp&apos;tan yazın
          </a>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-4 text-xs text-brand-muted/70 sm:px-6">
        © {new Date().getFullYear()} Fırat Oto Lastik
      </p>
    </footer>
  );
}
