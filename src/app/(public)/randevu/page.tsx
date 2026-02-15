import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getHizmetler } from "@/lib/db";
import { createAppointment, getReservedSlots } from "./actions";
import RandevuStepper from "@/components/RandevuStepper";

export const dynamic = "force-dynamic";

const steps = ["Hizmet", "İletişim", "Tarih/Saat", "Özet"];
const fallbackServices = [
  { title: "Lastik Değişimi", duration: "Tahmini süre: 60 dakika" },
  { title: "Lastik Tamiri", duration: "Tahmini süre: 60 dakika" },
  { title: "Balans Ayarı", duration: "Tahmini süre: 60 dakika" }
];

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

export default async function RandevuPage() {
  const hizmetler = await getHizmetler();
  const services =
    hizmetler.length > 0
      ? hizmetler.map((item) => ({
        title: item.name,
        duration: item.duration ? `Tahmini süre: ${item.duration} dakika` : ""
      }))
      : fallbackServices;
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  const timeSlots = buildTimeSlots();
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 lg:py-12">
        <section className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-br from-brand-gold/30 via-white/5 to-transparent p-6 backdrop-blur-md border border-brand-gold/20 lg:p-12">
            <div className="flex flex-col gap-10">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
                  Online Randevu
                </span>
                <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl lg:text-6xl leading-[1.1]">
                  <span className="text-brand-gold">Hızlı ve Güvenli</span> <br className="hidden sm:block" />
                  Randevu Sistemi
                </h1>
                <p className="mt-6 text-base text-white/70 leading-relaxed sm:text-lg max-w-2xl mx-auto lg:mx-0">
                  Tarih ve saat seçin, bilgilerinizi bırakın. Randevunuzu onaylamak için sizi telefonla arayacağız.
                </p>
              </div>

              <div className="mt-4">
                <RandevuStepper
                  action={createAppointment}
                  getReservedSlots={getReservedSlots}
                  services={services}
                  steps={steps}
                  timeSlots={timeSlots}
                  minDate={toIsoDate(today)}
                  maxDate={toIsoDate(maxDate)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
