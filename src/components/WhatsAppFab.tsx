import Image from "next/image";
import Link from "next/link";

export default function WhatsAppFab() {
  return (
    <Link
      href="https://wa.me/905387061065"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-2 text-sm text-white shadow-soft backdrop-blur hover:bg-[#1ebe5b] sm:bottom-6 sm:right-6 sm:bg-white/10 sm:px-4 sm:py-3 sm:hover:bg-white/20"
      aria-label="WhatsApp ile iletişim"
    >
      <span className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
        <Image
          src="/wp.svg"
          alt="WhatsApp"
          width={28}
          height={28}
          className="h-7 w-7"
        />
      </span>
      {/* Telefonda yazı gizli, sadece ikon: içeriğin ve butonların üstüne binmesin */}
      <span className="hidden sm:block">
        <span className="block text-xs text-white/60">WhatsApp ile iletişim</span>
        <span className="font-semibold">Bilgi ve destek</span>
      </span>
    </Link>
  );
}
