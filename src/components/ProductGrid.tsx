"use client";

import { useState } from "react";

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
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/5 to-white/10" />
              )}
            </div>
            <div className="space-y-2 p-5">
              <p className="text-lg font-semibold text-white">{product.title}</p>
              <p className="text-sm text-white/80 line-clamp-2">{product.description}</p>
              <p className="text-base font-semibold text-brand-gold">{product.price}</p>
              <p className="text-xs text-white/60">Detay için tıkla</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-brand-night text-white shadow-2xl">
            <button
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 h-10 w-10 rounded-full border border-white/10 bg-black/30 text-lg font-semibold text-white hover:bg-white/10"
              aria-label="Kapat"
            >
              ×
            </button>
            {active.image ? (
              <div className="flex h-64 w-full items-center justify-center bg-black/40">
                <img
                  src={active.image}
                  alt={active.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : null}
            <div className="space-y-3 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Ürün Detayı
              </p>
              <h2 className="text-2xl font-semibold">{active.title}</h2>
              <p className="text-sm text-brand-gold">{active.price}</p>
              <p className="text-sm text-white/80 leading-relaxed">{active.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
