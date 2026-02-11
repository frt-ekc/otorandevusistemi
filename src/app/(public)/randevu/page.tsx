import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getHizmetler } from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase";
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

async function createAppointment(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  "use server";

  const payload = {
    ad: String(formData.get("ad") ?? "").trim(),
    telefon: String(formData.get("telefon") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    plaka: String(formData.get("plaka") ?? "").trim(),
    hizmet: String(formData.get("hizmet") ?? "").trim(),
    tarih: String(formData.get("tarih") ?? "").trim(),
    saat: String(formData.get("saat") ?? "").trim(),
    not_metni: String(formData.get("not") ?? "").trim(),
    durum: "bekliyor"
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("randevular").insert([payload]);
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
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
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
        <section className="glass-card rounded-3xl px-8 py-10">
          <div className="flex flex-col gap-6">
            <div>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                Online Randevu
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Lastik servisi için randevu alın
              </h1>
              <p className="mt-3 text-muted">
                Tarih ve saat seçin, bilgilerinizi bırakın. Onay için sizinle
                iletişime geçeceğiz.
              </p>
            </div>

            <RandevuStepper
              action={createAppointment}
              services={services}
              steps={steps}
              timeSlots={timeSlots}
              minDate={toIsoDate(today)}
              maxDate={toIsoDate(maxDate)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
