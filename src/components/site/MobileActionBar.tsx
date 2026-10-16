import Image from "next/image";
import Link from "next/link";
import { TELEFON_LINK, WHATSAPP_LINK, YOL_TARIFI_LINK } from "./contact";

// Telefonda ekranın altında sabit duran eylem çubuğu: Randevu · WhatsApp · Ara · Yol tarifi
export default function MobileActionBar() {
  const item = "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[12px] font-semibold";
  return (
    <nav
      aria-label="Hızlı işlemler"
      className="fixed inset-x-3 bottom-3 z-50 flex gap-1 rounded-2xl border border-white/10 bg-[#1D1C1A]/90 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link href="/randevu" className={`${item} bg-brand-gold text-brand-dark`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M9 15l2 2 4-4" /></svg>
        Randevu
      </Link>
      <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className={`${item} text-brand-text`}>
        <Image src="/wp.svg" alt="" width={20} height={20} className="h-5 w-5" />
        WhatsApp
      </a>
      <a href={TELEFON_LINK} className={`${item} text-brand-text`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-gold" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02z" /></svg>
        Ara
      </a>
      <a href={YOL_TARIFI_LINK} target="_blank" rel="noreferrer" className={`${item} text-brand-text`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
        Yol tarifi
      </a>
    </nav>
  );
}
