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
        <section className="glass-card bg-haze overflow-hidden rounded-[2.5rem] p-1 shadow-2xl">
          <div className="w-full rounded-[2.3rem] bg-gradient-to-br from-brand-gold/30 via-white/5 to-transparent p-6 backdrop-blur-md border border-brand-gold/20 lg:p-12">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
                Ürünler
              </span>
              <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl lg:text-6xl leading-[1.1]">
                Kaliteli Ürünler, <br className="hidden sm:block" />
                <span className="text-brand-gold">Uygun Fiyatlar.</span>
              </h1>
              <p className="mt-6 text-base text-white/70 leading-relaxed sm:text-lg max-w-2xl mx-auto lg:mx-0">
                Lastik, jant ve bakım ürünlerimizi inceleyebilir, ihtiyacınıza uygun paketi seçebilirsiniz.
              </p>
            </div>

            <div className="mt-12">
              <ProductGrid products={products} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
