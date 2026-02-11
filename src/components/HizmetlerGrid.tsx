"use client";

import { useState } from "react";

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
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/5 to-white/10" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="relative flex min-h-[220px] flex-col justify-end gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold text-white">{service.title}</p>
                {service.duration ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/80">
                    {service.duration}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-white/80 line-clamp-2">{service.description}</p>
              <p className="text-xs text-white/60">Detay için tıkla</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="relative max-w-3xl w-full overflow-hidden rounded-3xl bg-brand-night text-white shadow-2xl">
            <button
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 h-10 w-10 rounded-full border border-white/10 bg-black/30 text-lg font-semibold text-white hover:bg-white/10"
              aria-label="Kapat"
            >
              ×
            </button>
            {active.image ? (
              <img
                src={active.image}
                alt={active.title}
                className="h-64 w-full object-cover"
              />
            ) : null}
            <div className="space-y-3 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Hizmet Detayı
              </p>
              <h2 className="text-2xl font-semibold">{active.title}</h2>
              {active.duration ? (
                <p className="text-sm text-white/70">Süre: {active.duration}</p>
              ) : null}
              <p className="text-sm text-white/80 leading-relaxed">{active.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
