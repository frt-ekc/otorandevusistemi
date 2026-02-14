import Link from "next/link";
import Image from "next/image";
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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 lg:gap-16 lg:py-12">
        <section className="glass-card bg-haze overflow-hidden rounded-3xl px-6 py-8">
          <div className="w-full rounded-2xl bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-5 backdrop-blur-sm lg:p-8">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white">
                  Uzman lastik hizmetleri
                </span>
                <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Yolculuğun Her Kilometresinde <span className="text-brand-gold">Ustalık ve Güven.</span>
                </h1>
                <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                  Fırat Oto Lastik olarak, 20 yılı aşkın tecrübemizi modern teknolojiyle birleştiriyoruz.
                  Sadece lastik değişimi değil; profesyonel balans ayarı ve
                  uzman teknik destekle sürüş güvenliğinizi standartların üzerine taşıyoruz.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    href="/randevu"
                    className="rounded-full bg-brand-gold px-10 py-4 text-sm font-black text-brand-dark shadow-xl transition-transform hover:scale-105 active:scale-95"
                  >
                    Hemen Randevu Al
                  </Link>
                  <Link
                    href="/hizmetler"
                    className="rounded-full border border-white/20 bg-white/5 px-10 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
                  >
                    Hizmetleri Keşfedin
                  </Link>
                </div>
              </div>

              <div className="relative aspect-square w-full max-w-[280px] self-center lg:max-w-[400px]">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-brand-gold/40 to-transparent blur-2xl opacity-30" />
                <Image
                  src="/ototakmasökme.png"
                  alt="Fırat Oto Lastik Hero"
                  width={600}
                  height={600}
                  className="relative aspect-square rounded-3xl border border-white/20 object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card bg-haze overflow-hidden rounded-3xl p-1">
          <div className="w-full rounded-[1.4rem] bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-6 backdrop-blur-sm border border-brand-gold/30 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-center lg:text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-white">Konum</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Bizi Ziyaret Edin</h2>
                <p className="mt-3 text-white/80">
                  Haritada görüntüleyin, yol tarifi alın ve dükkanımıza kolayca ulaşın.
                </p>
              </div>
              <Link
                href="https://maps.google.com"
                className="flex items-center justify-center rounded-full bg-brand-gold px-10 py-4 text-sm font-black text-brand-dark shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                Haritayı Aç
              </Link>
            </div>
            <div className="mt-8 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d787.9482594645065!2d38.31385462923506!3d38.35730500000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDIxJzI2LjMiTiAzOMKwMTgnNTEuMiJF!5e0!3m2!1str!2str!4v1707865000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Fırat Oto Lastik Konum"
              ></iframe>
            </div>
          </div>
        </section>

        <section id="hizmetler" className="glass-card bg-haze overflow-hidden rounded-3xl p-1">
          <div className="w-full rounded-[1.4rem] bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-8 backdrop-blur-sm border border-brand-gold/30 lg:p-12">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold">Kategoriler</p>
                <ul className="mt-6 space-y-3 text-white font-bold">
                  {categories.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-brand-gold/50" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold">Hizmetler</p>
                <ul className="mt-6 space-y-3 text-white font-bold">
                  {serviceList.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-brand-gold/50" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold">Servis Saatleri</p>
                <div className="mt-6 space-y-4 text-white font-bold md:max-w-[240px]">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="opacity-60">Pzt - Cuma</span>
                    <span>{ayarlar?.hafta_ici ?? "09:00 - 18:00"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="opacity-60">Cumartesi</span>
                    <span>{ayarlar?.cumartesi ?? "09:00 - 16:00"}</span>
                  </div>
                  <div className="flex justify-between text-brand-gold">
                    <span>Pazar</span>
                    <span>{ayarlar?.pazar ?? "Kapalı"}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white">İletişim</p>
                <div className="mt-4 space-y-4 text-white font-medium">
                  <p className="leading-relaxed">
                    {ayarlar?.adres ??
                      "Çırıkpınar Mahallesi, Arap Osman Caddesi, Şenpınar Düğün Salonu 60 m üstü, Fırat Oto Lastik, Malatya"}
                  </p>
                  <p className="text-lg font-bold text-brand-gold">{ayarlar?.telefon ?? "0 538 706 10 65"}</p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 shadow-md"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1877F2] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 shadow-md"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.77h-2.953v-3.429h2.953v-2.535c0-2.927 1.787-4.52 4.398-4.52 1.251 0 2.327.093 2.64.135v3.061h-1.812c-1.42 0-1.695.675-1.695 1.666v2.193h3.389l-.441 3.429h-2.948v8.77h6.142c.732 0 1.325-.593 1.325-1.324v-21.351c0-.732-.593-1.325-1.325-1.325z" />
                      </svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
