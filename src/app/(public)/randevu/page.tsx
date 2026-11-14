import Link from "next/link";
import TopNav from "@/components/TopNav";
import { createAppointment, getReservedSlots, mevcutRandevular } from "./actions";
import RandevuStepper from "@/components/RandevuStepper";
import KisLastigiUyarisi from "@/components/KisLastigiUyarisi";
import { hizmetKeyFromName } from "@/lib/lastikPaketleri";
import { getAyarlar } from "@/lib/db";
import { ILERI_GUN, calismaSaatleri, istanbulSimdi, tarihEkle } from "@/lib/calisma";
import { ONLINE_RANDEVU_ACIK } from "@/lib/randevuDurumu";
import { TELEFON_GORUNEN, TELEFON_LINK, WHATSAPP_LINK } from "@/components/site/contact";

export const dynamic = "force-dynamic";

export default async function RandevuPage({
  searchParams
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedService = resolvedParams.service || "";

  // Takvim, sitede gösterilen çalışma saatlerine göre açılır (admin panelindeki ayarlar)
  const ayarlar = await getAyarlar().catch(() => null);
  const saatler = calismaSaatleri(ayarlar);
  const telefonGorunen = ayarlar?.telefon || TELEFON_GORUNEN;
  const bugun = istanbulSimdi().tarih;
  return (
    <div className="min-h-screen">
      <TopNav />
      <KisLastigiUyarisi bugun={bugun} />
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
                  Anlaşmalı sendika üyelerine özel fiyatlarla lastik değişimi ve tamiri.{" "}
                  {ONLINE_RANDEVU_ACIK
                    ? "Paketinizi seçin, fiyatı görün, randevunuzu alın."
                    : "Randevu için bizi telefonla arayabilirsiniz."}
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

              {!ONLINE_RANDEVU_ACIK ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-brand-gold/60 bg-brand-gold/10 p-5 text-center sm:mt-4 sm:gap-5 sm:p-8">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-brand-dark">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
                      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8Z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white sm:text-3xl">Online randevu geçici olarak kapalıdır</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                      Randevularımızı şu an yalnızca telefonla alıyoruz. Lütfen bizi arayın; size uygun gün ve saati birlikte belirleyelim.
                    </p>
                  </div>
                  <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                    <a
                      href={TELEFON_LINK}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3.5 text-base font-extrabold text-brand-dark shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                      Hemen ara: {telefonGorunen}
                    </a>
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
              <div className="sm:mt-4">
                <RandevuStepper
                  action={createAppointment}
                  getReservedSlots={getReservedSlots}
                  mevcutRandevular={mevcutRandevular}
                  calismaSaatleri={saatler}
                  minDate={bugun}
                  maxDate={tarihEkle(bugun, ILERI_GUN)}
                  initialHizmet={hizmetKeyFromName(selectedService)}
                />
              </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
