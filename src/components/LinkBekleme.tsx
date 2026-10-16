"use client";

import { useLinkStatus } from "next/link";

// Bir <Link>'in içine konur: tıklanınca yeni sayfa gelene kadar küçük dönen bir halka gösterir.
// Sayfa hazırlanırken ekran donmuş gibi görünmesin diye.
// yerTut=false: beklemiyorken hiç yer kaplamaz (dar menü düğmeleri için)
export default function LinkBekleme({ className = "", yerTut = true }: { className?: string; yerTut?: boolean }) {
  const { pending } = useLinkStatus();
  if (!pending && !yerTut) return null;
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent transition-opacity ${pending ? "opacity-70" : "opacity-0"} ${className}`}
    />
  );
}
