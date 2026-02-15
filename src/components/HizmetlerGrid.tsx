"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative h-[90vh] sm:h-auto max-w-2xl w-full overflow-y-auto sm:overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-[#0c121e] text-white shadow-2xl border-t sm:border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
            <button
              onClick={() => setActive(null)}
              className="absolute right-6 top-6 h-12 w-12 rounded-2xl border border-white/10 bg-white/5 text-2xl font-light text-white hover:bg-white/10 z-20 flex items-center justify-center transition-all active:scale-90"
              aria-label="Kapat"
            >
              ×
            </button>
            {active.image ? (
              <div className="relative h-64 sm:h-80 w-full shrink-0">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c121e] to-transparent" />
              </div>
            ) : null}
            <div className="space-y-6 p-8 sm:p-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">
                  Hizmet Bilgisi
                </p>
                <h2 className="text-3xl font-black text-white leading-tight">{active.title}</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {active.duration ? (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-bold text-white">
                    <span className="text-brand-gold">⏱</span> Süre: {active.duration}
                  </div>
                ) : null}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />

              <p className="text-lg text-white/80 font-medium leading-relaxed">{active.description}</p>

              <div className="pt-6">
                <Link
                  href="/randevu"
                  onClick={() => setActive(null)}
                  className="flex w-full items-center justify-center rounded-2xl bg-brand-gold py-5 text-base font-black text-brand-dark shadow-2xl shadow-brand-gold/20 transition-all active:scale-95"
                >
                  Bu Hizmet İçin Randevu Al
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
