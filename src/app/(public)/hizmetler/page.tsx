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
        <section className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-br from-brand-gold/30 via-white/5 to-transparent p-6 backdrop-blur-md border border-brand-gold/20 lg:p-12">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
                Hizmetler
              </span>
              <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl lg:text-6xl leading-[1.1]">
                Hizmetlerimizle <br className="hidden sm:block" />
                <span className="text-brand-gold">Yanınızdayız.</span>
              </h1>
              <p className="mt-6 text-base text-white/70 leading-relaxed sm:text-lg max-w-2xl mx-auto lg:mx-0">
                Fırat Oto Lastik olarak sunduğumuz tüm profesyonel hizmetlerimize aşağıdan ulaşabilirsiniz.
              </p>
            </div>

            <div className="mt-12">
              <HizmetlerGrid services={services} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
