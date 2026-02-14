import TopNav from "@/components/TopNav";
import { searchLastikler, uniqueStrings, getLastikler } from "@/lib/db";
import LastikResultGrid from "@/components/LastikResultGrid";

export const dynamic = "force-dynamic";

type SearchParams = {
    genislik?: string;
    yanak?: string;
    jant?: string;
    marka?: string;
    ozellik?: string;
    durum?: string;
};

function hasFilters(params: SearchParams) {
    return Boolean(
        params.genislik ||
        params.yanak ||
        params.jant ||
        params.marka ||
        params.ozellik ||
        params.durum
    );
}

export default async function LastikSorgulaPage({
    searchParams: searchParamsPromise
}: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await searchParamsPromise;
    const filters = {
        genislik: searchParams.genislik ?? "",
        yanak: searchParams.yanak ?? "",
        jant: searchParams.jant ?? "",
        marka: searchParams.marka ?? "",
        ozellik: searchParams.ozellik ?? "",
        durum: searchParams.durum ?? ""
    };

    // Filtre seçenekleri için tüm lastikleri çek
    const allLastikler = await getLastikler();
    const genislikOptions = uniqueStrings(allLastikler.map((l) => l.genislik));
    const yanakOptions = uniqueStrings(allLastikler.map((l) => l.yanak));
    const jantOptions = uniqueStrings(allLastikler.map((l) => l.jant));
    const markaOptions = uniqueStrings(allLastikler.map((l) => l.marka));
    const ozellikOptions = uniqueStrings(allLastikler.map((l) => l.ozellik));

    const results = hasFilters(filters) ? await searchLastikler(filters) : [];

    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
                <section className="glass-card bg-haze overflow-hidden rounded-3xl px-6 py-8">
                    <div className="w-full rounded-2xl bg-gradient-to-r from-brand-gold/25 via-amber-300/20 to-brand-gold/10 p-5 backdrop-blur-sm border border-brand-gold/30 lg:p-10">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white">
                                Lastik Sorgula
                            </p>
                            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                Stok Sorgulama
                            </h1>
                            <p className="mt-4 text-base text-white leading-relaxed sm:text-lg">
                                Aradığınız lastik özelliklerini seçerek güncel stok durumumuzu anında kontrol edebilirsiniz.
                            </p>
                        </div>

                        <form
                            method="get"
                            className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/10 p-6 lg:grid-cols-3 backdrop-blur-md"
                        >
                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Genişlik
                                <select
                                    name="genislik"
                                    defaultValue={filters.genislik}
                                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all shadow-inner"
                                >
                                    <option value="">Tümü</option>
                                    {genislikOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Yanak
                                <select
                                    name="yanak"
                                    defaultValue={filters.yanak}
                                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all shadow-inner"
                                >
                                    <option value="">Tümü</option>
                                    {yanakOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Jant
                                <select
                                    name="jant"
                                    defaultValue={filters.jant}
                                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all shadow-inner"
                                >
                                    <option value="">Tümü</option>
                                    {jantOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Marka
                                <select
                                    name="marka"
                                    defaultValue={filters.marka}
                                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all shadow-inner"
                                >
                                    <option value="">Tümü</option>
                                    {markaOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Özellik
                                <select
                                    name="ozellik"
                                    defaultValue={filters.ozellik}
                                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all shadow-inner"
                                >
                                    <option value="">Tümü</option>
                                    {ozellikOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-white font-bold">
                                Durum
                                <select
                                    name="durum"
                                    defaultValue={filters.durum}
                                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all shadow-inner"
                                >
                                    <option value="">Tümü</option>
                                    <option value="sıfır">Sıfır</option>
                                    <option value="2.el">2. El</option>
                                </select>
                            </label>

                            <div className="flex items-end lg:col-span-3 mt-4">
                                <button className="w-full rounded-full bg-brand-gold px-6 py-4 text-base font-bold text-brand-dark shadow-[0_4px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-[1.01] active:scale-95 tracking-tight">
                                    Stok Sorgula
                                </button>
                            </div>
                        </form>

                        <p className="mt-4 text-sm text-white font-medium">
                            * İsim ve plaka bilgileri tam girilmelidir.
                        </p>

                        {hasFilters(filters) ? (
                            <div className="mt-10">
                                {results.length > 0 ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-6 text-brand-gold">
                                            <span className="h-px flex-1 bg-brand-gold/20" />
                                            <p className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                                                {results.length} ADET LASTİK BULUNDU
                                            </p>
                                            <span className="h-px flex-1 bg-brand-gold/20" />
                                        </div>
                                        <LastikResultGrid results={results} />
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
                                        <p className="text-white/50 font-medium italic">
                                            Üzgünüz, kriterlerinize uygun lastik stoklarımızda bulunmamaktadır.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
