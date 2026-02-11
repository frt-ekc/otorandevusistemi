import TopNav from "@/components/TopNav";
import { searchLastikler, uniqueStrings, getLastikler } from "@/lib/db";

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
    searchParams
}: {
    searchParams: SearchParams;
}) {
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
                <section className="glass-card rounded-3xl px-8 py-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                            Lastik Sorgula
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                            Stokta bulunan lastikleri sorgulayın
                        </h1>
                        <p className="mt-3 text-muted">
                            Aradığınız lastik özelliklerini seçin, stoktaki lastikleri
                            görüntüleyin.
                        </p>
                    </div>

                    <form
                        method="get"
                        className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-3"
                    >
                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Genişlik
                            <select
                                name="genislik"
                                defaultValue={filters.genislik}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            >
                                <option value="">Tümü</option>
                                {genislikOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Yanak
                            <select
                                name="yanak"
                                defaultValue={filters.yanak}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            >
                                <option value="">Tümü</option>
                                {yanakOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Jant
                            <select
                                name="jant"
                                defaultValue={filters.jant}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            >
                                <option value="">Tümü</option>
                                {jantOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Marka
                            <select
                                name="marka"
                                defaultValue={filters.marka}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            >
                                <option value="">Tümü</option>
                                {markaOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Özellik
                            <select
                                name="ozellik"
                                defaultValue={filters.ozellik}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            >
                                <option value="">Tümü</option>
                                {ozellikOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-white/70">
                            Durum
                            <select
                                name="durum"
                                defaultValue={filters.durum}
                                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            >
                                <option value="">Tümü</option>
                                <option value="sıfır">Sıfır</option>
                                <option value="2.el">2. El</option>
                            </select>
                        </label>

                        <div className="flex items-end lg:col-span-3">
                            <button className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                                Sorgula
                            </button>
                        </div>
                    </form>

                    {hasFilters(filters) ? (
                        <div className="mt-6">
                            {results.length > 0 ? (
                                <>
                                    <p className="mb-4 text-sm text-white/70">
                                        {results.length} adet lastik bulundu
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.map((lastik) => (
                                            <div
                                                key={lastik.id}
                                                className="rounded-2xl border border-white/10 bg-white/5 p-5"
                                            >
                                                <p className="text-lg font-semibold text-white">
                                                    {lastik.genislik}/{lastik.yanak} R{lastik.jant}
                                                </p>
                                                <p className="mt-2 text-sm text-white/60">
                                                    Marka: {lastik.marka ?? "-"}
                                                </p>
                                                {lastik.ozellik ? (
                                                    <p className="mt-1 text-sm text-white/60">
                                                        Özellik: {lastik.ozellik}
                                                    </p>
                                                ) : null}
                                                <p className="mt-1 text-sm text-white/60">
                                                    Durum:{" "}
                                                    <span className="font-semibold text-brand-accent">
                                                        {lastik.durum}
                                                    </span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-white/50">
                                    Bu özelliklerde lastik bulunamadı.
                                </p>
                            )}
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    );
}
