import Image from "next/image";
import Link from "next/link";

export default function WhatsAppFab() {
  return (
    <Link
      href="https://wa.me/905387061065"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm text-white shadow-soft backdrop-blur hover:bg-white/20"
      aria-label="WhatsApp ile iletişim"
    >
      <span className="flex h-12 w-12 items-center justify-center">
        <Image
          src="/wp.svg"
          alt="WhatsApp"
          width={28}
          height={28}
          className="h-7 w-7"
        />
      </span>
      <span>
        <span className="block text-xs text-white/60">WhatsApp ile iletişim</span>
        <span className="font-semibold">Bilgi ve destek</span>
      </span>
    </Link>
  );
}
