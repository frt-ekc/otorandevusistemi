"use client";

import { useState } from "react";
import Image from "next/image";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-brand-night text-white shadow-2xl border border-white/10">
            <button
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 h-10 w-10 rounded-full border border-white/20 bg-black/50 text-2xl font-bold text-white hover:bg-white/20 z-10"
              aria-label="Kapat"
            >
              ×
            </button>
            {active.image ? (
              <div className="relative h-72 w-full bg-black/40">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className="object-contain p-10"
                />
              </div>
            ) : null}
            <div className="space-y-4 p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-white font-bold">
                Ürün Detayı
              </p>
              <h2 className="text-3xl font-black text-brand-gold">{active.title}</h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-4 py-2 text-lg font-black text-brand-gold">
                {active.price}
              </div>
              <p className="text-base text-white font-medium leading-relaxed">{active.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
