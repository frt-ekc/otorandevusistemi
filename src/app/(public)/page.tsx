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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:gap-16 lg:py-12">
        {/* Hero Section */}
        <section className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-br from-brand-gold/30 via-amber-400/10 to-transparent p-6 backdrop-blur-md lg:p-16 flex flex-col justify-between">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse" />
                  Uzman lastik hizmetleri
                </span>
                <h1 className="mt-8 text-3xl font-black leading-[1.1] text-white sm:text-4xl lg:text-6xl">
                  Yolculuğun Her Kilometresinde <br className="hidden sm:block" />
                  <span className="text-brand-gold">Ustalık ve Güven.</span>
                </h1>
                <p className="mt-6 text-base leading-relaxed text-white/80 sm:text-lg lg:max-w-xl">
                  Fırat Oto Lastik olarak, 20 yılı aşkın tecrübemizi modern teknolojiyle birleştiriyoruz.
                  Profesyonel balans ayarı ve uzman teknik destekle sürüş güvenliğinizi en üst seviyeye taşıyoruz.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    href="/randevu"
                    className="group relative flex items-center justify-center overflow-hidden rounded-full bg-brand-gold px-10 py-5 text-sm font-black text-brand-dark shadow-[0_10px_30px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">Hemen Randevu Al</span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 transition-all group-hover:h-full group-hover:bg-black/5" />
                  </Link>
                  <Link
                    href="/hizmetler"
                    className="flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-10 py-5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
                  >
                    Hizmetleri Keşfedin
                  </Link>
                </div>
              </div>

              <div className="relative aspect-square w-full max-w-[300px] self-center lg:max-w-[450px]">
                <div className="absolute -inset-6 rounded-full bg-brand-gold/20 blur-[80px] opacity-40 animate-pulse" />
                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-gold/40 to-transparent blur-sm opacity-20" />
                <Image
                  src="/ototakmasökme.png"
                  alt="Fırat Oto Lastik Hero"
                  width={600}
                  height={600}
                  className="relative aspect-square rounded-[2.2rem] border border-white/20 object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-r from-brand-gold/15 via-white/5 to-transparent p-8 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-center gap-12 lg:p-12">
            <Image
              src="/bridgestone.svg"
              alt="Bridgestone"
              width={1000}
              height={300}
              className="h-56 w-auto object-contain brightness-0 invert opacity-50 hover:opacity-100 hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-500 cursor-pointer"
            />
          </div>
        </section>

        {/* Location Section */}
        <section className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-r from-brand-gold/25 via-amber-300/10 to-transparent p-6 backdrop-blur-md border border-brand-gold/20 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-center lg:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">Konum Bilgisi</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Bizi Ziyaret Edin</h2>
                <p className="mt-4 text-white/70 max-w-md">
                  Haritada görüntüleyin, yol tarifi alın ve modern dükkanımıza kolayca ulaşın.
                </p>
              </div>
              <Link
                href="https://maps.google.com"
                className="flex items-center justify-center rounded-full bg-brand-gold px-12 py-5 text-sm font-black text-brand-dark shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                Haritayı Aç
              </Link>
            </div>
            <div className="mt-10 h-[350px] rounded-[2rem] overflow-hidden border border-white/10 shadow-inner">
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

        {/* Footer/Info Section */}
        <section id="hizmetler" className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-br from-brand-gold/20 via-white/5 to-transparent p-8 backdrop-blur-sm border border-brand-gold/10 lg:p-12">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-6 text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Kategoriler</p>
                <ul className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:space-y-3 text-sm text-white/90 font-bold">
                  {categories.map((item) => (
                    <li key={item} className="flex items-center justify-center sm:justify-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/40" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6 text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Hizmetler</p>
                <ul className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:space-y-3 text-sm text-white/90 font-bold">
                  {serviceList.map((item) => (
                    <li key={item} className="flex items-center justify-center sm:justify-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/40" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6 text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Servis Saatleri</p>
                <div className="space-y-4 text-sm text-white font-bold max-w-[240px] mx-auto sm:mx-0">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="opacity-60">Pzt - Cuma</span>
                    <span>{ayarlar?.hafta_ici ?? "09:00 - 18:00"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="opacity-60">Cumartesi</span>
                    <span>{ayarlar?.cumartesi ?? "09:00 - 16:00"}</span>
                  </div>
                  <div className="flex justify-between text-brand-gold font-black">
                    <span>Pazar</span>
                    <span>{ayarlar?.pazar ?? "Kapalı"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6 text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">İletişim</p>
                <div className="space-y-6 text-white font-bold">
                  <p className="text-sm leading-relaxed opacity-80">
                    {ayarlar?.adres ??
                      "Çırıkpınar Mahallesi, Arap Osman Caddesi, Fırat Oto Lastik, Malatya"}
                  </p>
                  <p className="text-2xl font-black text-brand-gold tracking-tighter">{ayarlar?.telefon ?? "0 538 706 10 65"}</p>

                  <div className="flex justify-center sm:justify-start gap-4">
                    <a
                      href="#"
                      className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white transition-all hover:bg-brand-gold hover:text-brand-dark hover:scale-110 active:scale-90"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
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
