import TopNav from "@/components/TopNav";
import { getHizmetler } from "@/lib/db";
import HizmetlerGrid from "@/components/HizmetlerGrid";

export const dynamic = "force-dynamic";

const fallbackServices = [
  {
    title: "Lastik Değişimi",
    description: "Araç tipine uygun hızlı ve güvenli lastik değişimi.",
    duration: "60 dk"
  },
  {
    title: "Balans Ayarı",
    description: "Titreşimsiz sürüş için hassas balans ayarı.",
    duration: "45 dk"
  },
  {
    title: "Lastik Tamiri",
    description: "Delik ve hasarlara profesyonel tamir çözümleri.",
    duration: "40 dk"
  }
];

export default async function HizmetlerPage() {
  const hizmetler = await getHizmetler();
  const services =
    hizmetler.length > 0
      ? hizmetler.map((hizmet) => ({
        id: hizmet.id,
        title: hizmet.name,
        description: hizmet.description ?? "Açıklama eklenmemiş.",
        image: hizmet.image_url ?? "",
        duration: typeof hizmet.duration === "number" ? `${hizmet.duration} dk` : ""
      }))
      : fallbackServices.map((item, index) => ({
        id: `fallback-${index}`,
        title: item.title,
        description: item.description,
        image: "",
        duration: item.duration
      }));

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 lg:py-12">
        <section className="glass-card bg-haze overflow-hidden rounded-3xl p-1">
          <div className="w-full rounded-[1.4rem] bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-6 backdrop-blur-sm border border-brand-gold/30 lg:p-12">
            <div className="text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-white">
                Hizmetler
              </p>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                Hizmetlerimizle <span className="text-brand-gold">Yanınızdayız.</span>
              </h1>
              <p className="mt-4 text-base text-white/80 leading-relaxed sm:text-lg">
                Fırat Oto Lastik olarak sunduğumuz tüm profesyonel hizmetlerimize aşağıdan ulaşabilirsiniz.
              </p>
            </div>

            <div className="mt-10">
              <HizmetlerGrid services={services} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
