import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { createAppointment, getReservedSlots } from "./actions";
import RandevuStepper from "@/components/RandevuStepper";
import { hizmetKeyFromName } from "@/lib/lastikPaketleri";

export const dynamic = "force-dynamic";

function buildTimeSlots() {
  const slots: string[] = [];
  for (let hour = 8; hour <= 21; hour += 1) {
    for (const minute of [0, 30]) {
      const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`;
      slots.push(label);
    }
  }
  return slots;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function RandevuPage({
  searchParams
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedService = resolvedParams.service || "";

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  const timeSlots = buildTimeSlots();
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
              </div>

              <div className="sm:mt-4">
                <RandevuStepper
                  action={createAppointment}
                  getReservedSlots={getReservedSlots}
                  timeSlots={timeSlots}
                  minDate={toIsoDate(today)}
                  maxDate={toIsoDate(maxDate)}
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
