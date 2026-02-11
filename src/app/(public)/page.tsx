import Link from "next/link";
import TopNav from "@/components/TopNav";
import { getHizmetler, getAyarlar } from "@/lib/db";

export const dynamic = "force-dynamic";

const categories = ["Binek", "Jant", "Kamyonet", "Hafif Ticari", "SUV", "Ticari"];
const fallbackServices = [
  "Lastik Değişimi",
  "Balans Ayarı",
  "Lastik Tamiri",
  "Sibop Değişimi",
  "Jant Temizleme",
  "Jant Boyama"
];

export default async function HomePage() {
  const hizmetler = await getHizmetler();
  const ayarlar = await getAyarlar();
  const serviceList =
    hizmetler.length > 0 ? hizmetler.map((item) => item.name) : fallbackServices;
  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12">
        <section className="glass-card bg-haze rounded-3xl px-8 py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl rounded-2xl bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-4 backdrop-blur-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                Uzman lastik hizmetleri
              </span>
              <h1 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                Güvenli sürüş için doğru lastik hizmeti.
              </h1>
              <p className="mt-4 text-base text-muted sm:text-lg">
                Hızlı randevu ve stok sorgu ile zaman kazanın.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/randevu"
                  className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-dark shadow-soft"
                >
                  Randevu Al
                </Link>
                <Link
                  href="/sorgula"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Stok Sorgula
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Konum</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Konum</h2>
              <p className="mt-2 text-muted">
                Haritada görüntüleyin, yol tarifi alın.
              </p>
            </div>
            <Link
              href="https://maps.google.com"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              Haritayı aç
            </Link>
          </div>
          <div className="mt-8 h-64 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10" />
        </section>

        <section id="hizmetler" className="glass-card rounded-3xl p-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Kategoriler</p>
              <ul className="mt-4 space-y-2 text-white/80">
                {categories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Hizmetler</p>
              <ul className="mt-4 space-y-2 text-white/80">
                {serviceList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Servis Saatleri</p>
              <div className="mt-4 space-y-2 text-white/80">
                <div className="flex justify-between">
                  <span>Pzt - Cuma</span>
                  <span>{ayarlar?.hafta_ici ?? "09:00 - 18:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cumartesi</span>
                  <span>{ayarlar?.cumartesi ?? "09:00 - 16:00"}</span>
                </div>
                <div className="flex justify-between text-brand-gold">
                  <span>Pazar</span>
                  <span>{ayarlar?.pazar ?? "Kapalı"}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">İletişim</p>
              <div className="mt-4 space-y-3 text-white/80">
                <p>
                  {ayarlar?.adres ??
                    "Çırıkpınar Mahallesi, Arap Osman Caddesi, Şenpınar Düğün Salonu 60 m üstü, Fırat Oto Lastik, Malatya"}
                </p>
                <p>{ayarlar?.telefon ?? "0 538 706 10 65"}</p>
                <div className="flex gap-3 text-white/50">
                  <span className="h-10 w-10 rounded-full bg-white/10" />
                  <span className="h-10 w-10 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
