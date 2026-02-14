import TopNav from "@/components/TopNav";
import { getUrunler } from "@/lib/db";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

const fallbackProducts = [
  {
    id: "fallback-1",
    title: "Kış Lastiği Paketi",
    description: "Güvenli sürüş için 4 mevsim ve kış lastikleri.",
    price: "₺12.500"
  },
  {
    id: "fallback-2",
    title: "Jant Temizleme",
    description: "Jantlarınızı koruyan profesyonel temizlik hizmeti.",
    price: "₺750"
  },
  {
    id: "fallback-3",
    title: "Lastik Tamir Kiti",
    description: "Acil durumlar için hızlı çözüm sağlayan kit.",
    price: "₺1.250"
  }
];

export default async function UrunlerPage() {
  const urunler = await getUrunler();
  const products =
    urunler.length > 0
      ? urunler.map((urun) => ({
        id: urun.id,
        title: urun.name,
        description: "Açıklama eklenmemiş.",
        price: urun.fiyat ? `₺${urun.fiyat}` : "Fiyat belirtilmedi",
        image: urun.image_url ?? ""
      }))
      : fallbackProducts;
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 lg:py-12">
        <section className="glass-card bg-haze overflow-hidden rounded-3xl p-1">
          <div className="w-full rounded-[1.4rem] bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-6 backdrop-blur-sm border border-brand-gold/30 lg:p-12">
            <div className="text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-white">
                Ürünler
              </p>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                Kaliteli Ürünler, <span className="text-brand-gold">Uygun Fiyatlar.</span>
              </h1>
              <p className="mt-4 text-base text-white/80 leading-relaxed sm:text-lg">
                Lastik, jant ve bakım ürünlerimizi inceleyebilir, ihtiyacınıza uygun paketi seçebilirsiniz.
              </p>
            </div>

            <div className="mt-10">
              <ProductGrid products={products} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
