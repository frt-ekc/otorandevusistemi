import TopNav from "@/components/TopNav";

// Müşteri sayfaları her açılışta sunucuda hazırlanıyor. Bu iskelet tıklar tıklamaz
// gösterilir, sayfa hazır olunca yerini gerçek içerik alır.
export default function Loading() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Sayfa yükleniyor">
        <div className="h-4 w-32 animate-pulse rounded-full bg-brand-gold/30" />
        <div className="mt-5 h-10 w-3/4 max-w-xl animate-pulse rounded-2xl bg-white/[0.07] sm:h-14" />
        <div className="mt-4 h-4 w-2/3 max-w-md animate-pulse rounded-full bg-white/[0.05]" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" />
          <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" />
        </div>
      </main>
    </div>
  );
}
