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
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
        <section className="glass-card rounded-3xl px-8 py-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Hizmetler
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Güvenli sürüş için uzman bakım
            </h1>
            <p className="mt-3 text-muted">
              Hizmet güvenliği ve performansı için uyguluyoruz. Kısa açıklamalar aşağıda.
            </p>
          </div>

          <HizmetlerGrid services={services} />
        </section>
      </main>
    </div>
  );
}
