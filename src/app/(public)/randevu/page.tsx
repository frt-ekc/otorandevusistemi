import Link from "next/link";
import TopNav from "@/components/TopNav";
import { createAppointment, getReservedSlots } from "./actions";
import RandevuStepper from "@/components/RandevuStepper";
import { hizmetKeyFromName } from "@/lib/lastikPaketleri";
import { getAyarlar } from "@/lib/db";
import { ILERI_GUN, calismaSaatleri, istanbulSimdi, tarihEkle } from "@/lib/calisma";

export const dynamic = "force-dynamic";

export default async function RandevuPage({
  searchParams
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedService = resolvedParams.service || "";

  // Takvim, sitede gösterilen çalışma saatlerine göre açılır (admin panelindeki ayarlar)
  const saatler = calismaSaatleri(await getAyarlar().catch(() => null));
  const bugun = istanbulSimdi().tarih;
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-3 py-4 sm:px-4 sm:py-8 lg:py-12">
        <section className="glass-card bg-haze overflow-hidden rounded-[2rem] p-1 shadow-2xl sm:rounded-[2.5rem]">
          <div className="w-full rounded-[2.3rem] bg-brand-slate/70 p-3 backdrop-blur-md border border-white/10 sm:p-6 lg:p-12">
            <div className="flex flex-col gap-5 sm:gap-10">
              <div className="text-center lg:text-left">
                <span className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90 sm:inline-flex">
                  Online Randevu
                </span>
                <h1 className="mt-2 text-2xl font-black leading-[1.1] text-white sm:mt-6 sm:text-4xl lg:text-6xl">
                  <span className="text-brand-gold">Hızlı ve Güvenli</span> <br className="hidden sm:block" />
                  Randevu Sistemi
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:mt-6 sm:text-lg lg:mx-0">
                  Anlaşmalı sendika üyelerine özel fiyatlarla lastik değişimi ve tamiri. Paketinizi seçin, fiyatı görün, randevunuzu alın.
                </p>
                <div className="mx-auto mt-4 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 sm:mt-6 sm:flex-row sm:justify-between sm:p-4 lg:mx-0">
                  <p className="text-sm font-semibold text-white">Mevcut randevunuzu iptal etmek mi istiyorsunuz?</p>
                  <Link
                    href="/randevu-sorgula"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)] transition-transform hover:-translate-y-0.5 hover:bg-rose-600 active:translate-y-0"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7.3 6.3a1 1 0 0 0-1.4 1.4L8.6 10l-2.7 2.3a1 1 0 1 0 1.4 1.4L10 11.4l2.3 2.3a1 1 0 0 0 1.4-1.4L11.4 10l2.3-2.3a1 1 0 0 0-1.4-1.4L10 8.6 7.3 6.3Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Randevumu iptal et
                  </Link>
                </div>
              </div>

              <div className="sm:mt-4">
                <RandevuStepper
                  action={createAppointment}
                  getReservedSlots={getReservedSlots}
                  calismaSaatleri={saatler}
                  minDate={bugun}
                  maxDate={tarihEkle(bugun, ILERI_GUN)}
                  initialHizmet={hizmetKeyFromName(selectedService)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
