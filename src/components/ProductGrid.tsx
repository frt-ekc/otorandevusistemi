"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ProductCard = {
  id: string;
  title: string;
  description: string;
  price: string;
  image?: string;
};

export default function ProductGrid({ products }: { products: ProductCard[] }) {
  const [active, setActive] = useState<ProductCard | null>(null);

  return (
    <>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => setActive(product)}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
          >
            <div className="flex h-48 w-full items-center justify-center bg-black/20">
              {product.image ? (
                <div className="relative h-full w-full">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/5 to-white/10" />
              )}
            </div>
            <div className="space-y-2 p-5">
              <p className="text-xl font-black text-white group-hover:text-brand-gold transition-colors">{product.title}</p>
              <p className="text-sm text-white font-medium line-clamp-2">{product.description}</p>
              <p className="text-lg font-black text-brand-gold">{product.price}</p>
              <p className="text-xs text-white font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Detay için tıkla</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative h-[90vh] sm:h-auto max-w-2xl w-full overflow-y-auto sm:overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-[#0c121e] text-white shadow-2xl border-t sm:border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
            <button
              onClick={() => setActive(null)}
              className="absolute right-6 top-6 h-12 w-12 rounded-2xl border border-white/10 bg-white/5 text-2xl font-light text-white hover:bg-white/10 z-20 flex items-center justify-center transition-all active:scale-90"
              aria-label="Kapat"
            >
              ×
            </button>
            {active.image ? (
              <div className="relative h-72 sm:h-96 w-full bg-black/40 p-12 sm:p-20 shrink-0">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c121e] to-transparent" />
              </div>
            ) : null}
            <div className="space-y-6 p-8 sm:p-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">
                  Ürün Bilgisi
                </p>
                <h2 className="text-3xl font-black text-white leading-tight">{active.title}</h2>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="inline-flex items-center gap-2 rounded-xl bg-brand-gold/10 border border-brand-gold/20 px-5 py-3 text-2xl font-black text-brand-gold">
                  {active.price}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">KDV Dahil</span>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />

              <p className="text-lg text-white/80 font-medium leading-relaxed">{active.description}</p>

              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="https://wa.me/905387061065"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-5 text-base font-black text-white shadow-2xl shadow-[#25D366]/20 transition-all active:scale-95"
                >
                  <Image src="/wp.svg" alt="WA" width={24} height={24} className="brightness-200" />
                  Sipariş Ver
                </a>
                <Link
                  href="/randevu"
                  onClick={() => setActive(null)}
                  className="flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 py-5 text-base font-black text-white transition-all active:bg-white/10 active:scale-95"
                >
                  Montaj Randevusu
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
