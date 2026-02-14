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
    plaka: String(formData.get("plaka") ?? "").trim().toUpperCase(),
    hizmet: String(formData.get("hizmet") ?? "").trim(),
    tarih: String(formData.get("tarih") ?? "").trim(),
    saat: String(formData.get("saat") ?? "").trim(),
    not_metni: String(formData.get("not") ?? "").trim(),
    durum: "bekliyor"
  };

  if (!payload.plaka || !payload.telefon) {
    return { ok: false, message: "Plaka ve telefon alanları zorunludur." };
  }

  const supabase = getSupabaseServerClient();

  // Mevcut aktif randevu kontrolü (Aynı gün, aynı plaka kontrolü)
  const { data: existing, error: checkError } = await supabase
    .from("randevular")
    .select("id")
    .eq("plaka", payload.plaka)
    .eq("tarih", payload.tarih)
    .neq("durum", "iptal")
    .limit(1);

  if (checkError) {
    return { ok: false, message: "Doğrulama hatası oluştu." };
  }

  if (existing && existing.length > 0) {
    return {
      ok: false,
      message: "Bu plaka için bu tarihte zaten aktif bir randevu bulunmaktadır."
    };
  }

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
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 lg:py-12">
        <section className="glass-card bg-haze overflow-hidden rounded-3xl p-1">
          <div className="w-full rounded-[1.4rem] bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-6 backdrop-blur-sm border border-brand-gold/30 lg:p-12">
            <div className="flex flex-col gap-8">
              <div className="text-center lg:text-left">
                <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70">
                  Online Randevu
                </span>
                <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                  <span className="text-brand-gold">Hızlı ve Güvenli</span> Randevu
                </h1>
                <p className="mt-4 text-base text-white/80 leading-relaxed sm:text-lg">
                  Tarih ve saat seçin, bilgilerinizi bırakın. Onay için sizinle iletişime geçeceğiz.
                </p>
              </div>

              <div className="mt-4">
                <RandevuStepper
                  action={createAppointment}
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
