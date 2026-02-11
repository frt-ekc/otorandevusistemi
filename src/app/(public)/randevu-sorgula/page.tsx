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
    searchParams
}: {
    searchParams: SearchParams;
}) {
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
                <section className="glass-card rounded-3xl px-8 py-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                            Randevu Sorgula
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                            Ad Soyad ve Plaka ile randevu sorgulama
                        </h1>
                        <p className="mt-3 text-muted">
                            Bilgilerinizi girin, oluşturduğunuz randevuyu görüntüleyin.
                        </p>
                    </div>

                    <form
                        method="get"
                        className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-2"
                    >
                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Ad Soyad
                            <input
                                name="ad"
                                defaultValue={filters.ad}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Plaka
                            <input
                                name="plaka"
                                defaultValue={filters.plaka}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                                required
                            />
                        </label>
                        <div className="flex items-end">
                            <button className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                                Sorgula
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-sm text-white/50">
                        İsim ve plaka bilgileri tam girilmelidir.
                    </p>
                    {hasFilters(filters) ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {results.map((randevu) => (
                                <div
                                    key={randevu.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                                >
                                    <p className="text-lg font-semibold text-white">
                                        {randevu.hizmet}
                                    </p>
                                    <p className="mt-2 text-sm text-white/60">
                                        {randevu.ad} · {randevu.telefon}
                                    </p>
                                    <p className="mt-1 text-sm text-white/60">
                                        Plaka: {randevu.plaka ?? "-"}
                                    </p>
                                    <p className="mt-1 text-sm text-white/60">
                                        Tarih/Saat: {randevu.tarih} {randevu.saat}
                                    </p>
                                    {randevu.not_metni ? (
                                        <p className="mt-1 text-sm text-white/60">
                                            Not: {randevu.not_metni}
                                        </p>
                                    ) : null}
                                    <p className="mt-1 text-sm text-white/60">Durum: {randevu.durum}</p>
                                </div>
                            ))}
                            {results.length === 0 ? (
                                <p className="text-sm text-white/50">
                                    Bu bilgilerle randevu bulunamadı.
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    );
}
