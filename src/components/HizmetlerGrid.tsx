"use client";

import { useState } from "react";
import Image from "next/image";

type ServiceCard = {
  id: string;
  title: string;
  description: string;
  image?: string;
  duration?: string;
};

export default function HizmetlerGrid({ services }: { services: ServiceCard[] }) {
  const [active, setActive] = useState<ServiceCard | null>(null);

  return (
    <>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setActive(service)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
          >
            <div className="absolute inset-0">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/5 to-white/10" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="relative flex min-h-[220px] flex-col justify-end gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-black text-white group-hover:text-brand-gold transition-colors">{service.title}</p>
                {service.duration ? (
                  <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-dark">
                    {service.duration}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-white font-medium line-clamp-2">{service.description}</p>
              <p className="text-xs text-white font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Detay için tıkla</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full overflow-hidden rounded-3xl bg-brand-night text-white shadow-2xl border border-white/10">
            <button
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 h-10 w-10 rounded-full border border-white/20 bg-black/50 text-2xl font-bold text-white hover:bg-white/20 z-10"
              aria-label="Kapat"
            >
              ×
            </button>
            {active.image ? (
              <div className="relative h-72 w-full">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-4 p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-white font-bold">
                Hizmet Detayı
              </p>
              <h2 className="text-3xl font-black text-brand-gold">{active.title}</h2>
              {active.duration ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                  Süre: {active.duration}
                </div>
              ) : null}
              <p className="text-base text-white font-medium leading-relaxed">{active.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
