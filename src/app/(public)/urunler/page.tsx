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
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
        <section className="glass-card rounded-3xl px-8 py-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Ürünler
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Öne çıkan ürün ve paketler
            </h1>
            <p className="mt-3 text-muted">
              Lastik, jant ve bakım ürünlerimizi inceleyin.
            </p>
          </div>

          <ProductGrid products={products} />
        </section>
      </main>
    </div>
  );
}
