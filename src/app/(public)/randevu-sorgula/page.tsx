import TopNav from "@/components/TopNav";
import { searchRandevular } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchParams = {
    ad?: string;
    plaka?: string;
};

function hasFilters(params: SearchParams) {
    return Boolean(params.ad || params.plaka);
}

export default async function RandevuSorgulaPage({
    searchParams: searchParamsPromise
}: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await searchParamsPromise;
    const filters = {
        ad: searchParams.ad ?? "",
        plaka: searchParams.plaka ?? ""
    };
    const results = hasFilters(filters)
        ? await searchRandevular(filters.ad, filters.plaka)
        : [];
    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
                <section className="glass-card bg-haze overflow-hidden rounded-3xl px-6 py-8">
                    <div className="w-full rounded-2xl bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-5 backdrop-blur-sm border border-brand-gold/30 lg:p-10">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white">
                                Randevu Sorgula
                            </p>
                            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                Randevunu Sorgula
                            </h1>
                            <p className="mt-4 text-base text-white leading-relaxed sm:text-lg">
                                Ad Soyad ve Plaka bilgilerinizi girerek oluşturduğunuz randevuyu görüntüleyebilirsiniz.
                            </p>
                        </div>

                        <form
                            method="get"
                            className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/10 p-6 lg:grid-cols-2 backdrop-blur-md"
                        >
                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Ad Soyad
                                <input
                                    name="ad"
                                    defaultValue={filters.ad}
                                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40"
                                    required
                                    placeholder="Ad Soyad"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Plaka
                                <input
                                    name="plaka"
                                    defaultValue={filters.plaka}
                                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40"
                                    required
                                    placeholder="44 XX 444"
                                />
                            </label>
                            <div className="flex items-end">
                                <button className="w-full rounded-full bg-brand-gold px-6 py-3 text-sm font-black text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-transform hover:scale-105">
                                    Sorgula
                                </button>
                            </div>
                        </form>

                        <p className="mt-4 text-sm text-white font-medium">
                            * İsim ve plaka bilgileri tam girilmelidir.
                        </p>

                        {hasFilters(filters) ? (
                            <div className="mt-10 grid gap-4 md:grid-cols-2">
                                {results.map((randevu) => (
                                    <div
                                        key={randevu.id}
                                        className="rounded-2xl border border-brand-gold/20 bg-white/10 p-6 backdrop-blur-md"
                                    >
                                        <p className="text-2xl font-black text-brand-gold">
                                            {randevu.hizmet}
                                        </p>
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 pb-1 font-medium">
                                                <span className="text-white">Müşteri:</span>
                                                <span className="font-bold">{randevu.ad}</span>
                                            </p>
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 pb-1 font-medium">
                                                <span className="text-white">Telefon:</span>
                                                <span className="font-bold">{randevu.telefon}</span>
                                            </p>
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 pb-1 font-medium">
                                                <span className="text-white">Plaka:</span>
                                                <span className="font-bold">{randevu.plaka ?? "-"}</span>
                                            </p>
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 pb-1 font-medium">
                                                <span className="text-white">Tarih:</span>
                                                <span className="font-bold">{randevu.tarih}</span>
                                            </p>
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 pb-1 font-medium">
                                                <span className="text-white">Saat:</span>
                                                <span className="font-bold">{randevu.saat}</span>
                                            </p>
                                            <p className="text-sm text-white flex justify-between font-medium">
                                                <span className="text-white">Durum:</span>
                                                <span className="text-brand-gold uppercase font-black text-xs tracking-widest">{randevu.durum}</span>
                                            </p>
                                        </div>
                                        {randevu.not_metni ? (
                                            <p className="mt-4 text-sm text-white italic font-medium bg-white/5 p-3 rounded-lg border border-white/5">
                                                "{randevu.not_metni}"
                                            </p>
                                        ) : null}
                                    </div>
                                ))}
                                {results.length === 0 ? (
                                    <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
                                        <p className="text-white font-bold italic">Bu bilgilerle eşleşen bir randevu bulunamadı.</p>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
