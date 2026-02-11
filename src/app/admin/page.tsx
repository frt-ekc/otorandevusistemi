import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getLastikler,
  getRandevular,
  getUrunler,
  deleteRandevu,
  getAyarlar,
  getHizmetler
} from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getCounts() {
  const supabase = getSupabaseServerClient();
  const [{ count: randevular }, { count: stok }] = await Promise.all([
    supabase.from("randevular").select("id", { count: "exact", head: true }),
    supabase.from("lastikler").select("id", { count: "exact", head: true })
  ]);

  return {
    randevular: randevular ?? 0,
    stok: stok ?? 0
  };
}

async function createLastik(formData: FormData) {
  "use server";

  const genislik = String(formData.get("genislik") ?? "").trim();
  const yanak = String(formData.get("yanak") ?? "").trim();
  const jant = String(formData.get("jant") ?? "").trim();
  const marka = String(formData.get("marka") ?? "").trim();
  const ozellik = String(formData.get("ozellik") ?? "").trim();
  const durum = String(formData.get("durum") ?? "").trim();

  if (!genislik || !yanak || !jant || !marka || !ozellik || !durum) {
    redirect("/admin?lastik=0&error=Eksik%20bilgi");
  }

  const payload = {
    genislik: genislik || null,
    yanak: yanak || null,
    jant: jant || null,
    marka: marka || null,
    ozellik: ozellik || null,
    durum: durum || null
  };

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("lastikler")
    .insert([payload])
    .select("id")
    .single();
  if (error) {
    redirect(`/admin?lastik=0&error=${encodeURIComponent(error.message)}`);
  }
  if (!data?.id) {
    redirect("/admin?lastik=0&error=Kayit%20donmedi");
  }
  redirect(`/admin?lastik=1&id=${data.id}`);
}

async function cancelRandevu(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin?randevu=0&error=Randevu%20bulunamadi");
  }
  const result = await deleteRandevu(id);
  if (!result.ok) {
    redirect(`/admin?randevu=0&error=${encodeURIComponent(result.message ?? "")}`);
  }
  redirect(`/admin?randevu=1&id=${id}`);
}

async function createUrun(formData: FormData) {
  "use server";

  const ad = String(formData.get("ad") ?? "").trim();
  const fiyatRaw = String(formData.get("fiyat") ?? "").trim();
  const fiyat = fiyatRaw ? Number(fiyatRaw) : null;
  const gorsel = formData.get("gorsel");

  if (!ad) {
    redirect("/admin?view=urunler&urun=0&error=Eksik%20bilgi");
  }

  const supabase = getSupabaseServerClient();
  let image_url: string | null = null;
  let image_path: string | null = null;

  if (gorsel instanceof File && gorsel.size > 0) {
    const extension = gorsel.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = `products/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, gorsel, {
        cacheControl: "3600",
        upsert: false,
        contentType: gorsel.type || "image/png"
      });
    if (uploadError) {
      redirect(
        `/admin?view=urunler&urun=0&error=${encodeURIComponent(uploadError.message)}`
      );
    }
    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    image_url = data.publicUrl;
    image_path = filePath;
  }

  const payload = {
    name: ad,
    fiyat,
    image_url,
    image_path
  };

  const { error } = await supabase.from("products").insert([payload]);
  if (error) {
    redirect(`/admin?view=urunler&urun=0&error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?view=urunler&urun=1");
}

async function deleteUrun(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const image_path = String(formData.get("image_path") ?? "");
  if (!id) {
    redirect("/admin?view=urunler&urun=0&error=Urun%20bulunamadi");
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    redirect(`/admin?view=urunler&urun=0&error=${encodeURIComponent(error.message)}`);
  }
  if (image_path) {
    await supabase.storage.from("products").remove([image_path]);
  }
  redirect("/admin?view=urunler&urun=1");
}

async function updateUrun(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const fiyatRaw = String(formData.get("fiyat") ?? "").trim();
  const fiyat = fiyatRaw ? Number(fiyatRaw) : null;
  const gorsel = formData.get("gorsel");
  const currentImagePath = String(formData.get("current_image_path") ?? "");

  if (!id || !ad) {
    redirect("/admin?view=urunler&urun=0&error=Eksik%20bilgi");
  }

  const supabase = getSupabaseServerClient();
  let image_url: string | null = null;
  let image_path: string | null = null;

  if (gorsel instanceof File && gorsel.size > 0) {
    const extension = gorsel.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = `products/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, gorsel, {
        cacheControl: "3600",
        upsert: false,
        contentType: gorsel.type || "image/png"
      });
    if (uploadError) {
      redirect(
        `/admin?view=urunler&urun=0&error=${encodeURIComponent(uploadError.message)}`
      );
    }
    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    image_url = data.publicUrl;
    image_path = filePath;

    if (currentImagePath) {
      await supabase.storage.from("products").remove([currentImagePath]);
    }
  }

  const payload: Record<string, unknown> = {
    name: ad,
    fiyat
  };
  if (image_url) payload.image_url = image_url;
  if (image_path) payload.image_path = image_path;

  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) {
    redirect(`/admin?view=urunler&urun=0&error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?view=urunler&urun=1");
}

async function createHizmet(formData: FormData) {
  "use server";

  const ad = String(formData.get("ad") ?? "").trim();
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const sureRaw = String(formData.get("sure_dk") ?? "").trim();
  const sure_dk = sureRaw ? Number(sureRaw) : null;
  const gorsel = formData.get("gorsel");

  if (!ad) {
    redirect("/admin?view=hizmetler&hizmet=0&error=Eksik%20bilgi");
  }

  const supabase = getSupabaseServerClient();
  let gorsel_url: string | null = null;
  let gorsel_path: string | null = null;

  if (gorsel instanceof File && gorsel.size > 0) {
    const extension = gorsel.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = `services/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("services")
      .upload(filePath, gorsel, {
        cacheControl: "3600",
        upsert: false,
        contentType: gorsel.type || "image/png"
      });
    if (uploadError) {
      redirect(
        `/admin?view=hizmetler&hizmet=0&error=${encodeURIComponent(
          uploadError.message
        )}`
      );
    }
    const { data } = supabase.storage.from("services").getPublicUrl(filePath);
    gorsel_url = data.publicUrl;
    gorsel_path = filePath;
  }

  const payload = {
    name: ad,
    description: aciklama || null,
    duration: sure_dk,
    image_url: gorsel_url,
    image_path: gorsel_path
  };

  const { error } = await supabase.from("services").insert([payload]);
  if (error) {
    redirect(`/admin?view=hizmetler&hizmet=0&error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?view=hizmetler&hizmet=1");
}

async function deleteHizmet(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const gorsel_path = String(formData.get("gorsel_path") ?? "");
  if (!id) {
    redirect("/admin?view=hizmetler&hizmet=0&error=Hizmet%20bulunamadi");
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    redirect(`/admin?view=hizmetler&hizmet=0&error=${encodeURIComponent(error.message)}`);
  }
  if (gorsel_path) {
    await supabase.storage.from("services").remove([gorsel_path]);
  }
  redirect("/admin?view=hizmetler&hizmet=1");
}

async function updateHizmet(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const aciklama = String(formData.get("aciklama") ?? "").trim();
  const sureRaw = String(formData.get("sure_dk") ?? "").trim();
  const sure_dk = sureRaw ? Number(sureRaw) : null;
  const gorsel = formData.get("gorsel");
  const currentImagePath = String(formData.get("current_image_path") ?? "");

  if (!id || !ad) {
    redirect("/admin?view=hizmetler&hizmet=0&error=Eksik%20bilgi");
  }

  const supabase = getSupabaseServerClient();

  let image_url: string | null = null;
  let image_path: string | null = null;

  if (gorsel instanceof File && gorsel.size > 0) {
    const extension = gorsel.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = `services/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("services")
      .upload(filePath, gorsel, {
        cacheControl: "3600",
        upsert: false,
        contentType: gorsel.type || "image/png"
      });
    if (uploadError) {
      redirect(
        `/admin?view=hizmetler&hizmet=0&error=${encodeURIComponent(
          uploadError.message
        )}`
      );
    }
    const { data } = supabase.storage.from("services").getPublicUrl(filePath);
    image_url = data.publicUrl;
    image_path = filePath;

    if (currentImagePath) {
      await supabase.storage.from("services").remove([currentImagePath]);
    }
  }

  const payload: Record<string, unknown> = {
    name: ad,
    description: aciklama || null,
    duration: sure_dk
  };
  if (image_url) payload.image_url = image_url;
  if (image_path) payload.image_path = image_path;

  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) {
    redirect(`/admin?view=hizmetler&hizmet=0&error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?view=hizmetler&hizmet=1");
}

async function seedHizmetler() {
  "use server";

  const defaults = [
    {
      name: "Sibop Değişimi",
      description: "Basınç kaybını önler, lastiklerin hava tutmasını sağlar.",
      duration: 20
    },
    {
      name: "Balans Ayarı",
      description: "Titreşimi azaltır, dengeli sürüş sağlar.",
      duration: 45
    },
    {
      name: "Lastik Değişimi",
      description: "Mevsime uygun lastik ile yol tutuşu ve fren mesafesini iyileştirir.",
      duration: 60
    },
    {
      name: "Jant tamiri ve boyama",
      description: "Jantı korur, görünümü yeniler.",
      duration: 90
    },
    {
      name: "Lastik Tamiri",
      description: "Güvenli onarım ile lastik ömrünü uzatır.",
      duration: 40
    },
    {
      name: "2. El ve Sıfır Lastik Alım Satım",
      description: "İhtiyaca uygun lastik alım ve satım seçenekleri.",
      duration: 30
    }
  ];

  const supabase = getSupabaseServerClient();
  const { data: existing } = await supabase.from("services").select("name");
  const existingNames = new Set((existing ?? []).map((row) => (row as any).name));
  const toInsert = defaults.filter((item) => !existingNames.has(item.name));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("services").insert(toInsert);
    if (error) {
      redirect(`/admin?view=hizmetler&hizmet=0&error=${encodeURIComponent(error.message)}`);
    }
  }
  redirect("/admin?view=hizmetler&hizmet=1");
}

async function updateAyarlar(formData: FormData) {
  "use server";

  const haftaIci = String(formData.get("hafta_ici") ?? "").trim();
  const cumartesi = String(formData.get("cumartesi") ?? "").trim();
  const pazar = String(formData.get("pazar") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  const payload = {
    id: 1,
    hafta_ici: haftaIci || null,
    cumartesi: cumartesi || null,
    pazar: pazar || null,
    adres: adres || null,
    telefon: telefon || null,
    whatsapp: whatsapp || null
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("ayarlar").upsert(payload);
  if (error) {
    redirect(`/admin?view=ayarlar&error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?view=ayarlar&ayarlar=1");
}
export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{
    lastik?: string;
    randevu?: string;
    error?: string;
    id?: string;
    urun?: string;
    urunEkle?: string;
    hizmet?: string;
    ayarlar?: string;
    view?: string;
  }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const lastikStatus = resolvedParams?.lastik;
  const randevuStatus = resolvedParams?.randevu;
  const urunStatus = resolvedParams?.urun;
  const hizmetStatus = resolvedParams?.hizmet;
  const ayarlarStatus = resolvedParams?.ayarlar;
  const errorMessage = resolvedParams?.error
    ? decodeURIComponent(resolvedParams.error)
    : "";
  const insertedId = resolvedParams?.id ?? "";
  const activeView = resolvedParams?.view ?? "randevular";
  const isUrunFormOpen = resolvedParams?.urunEkle === "1";
  const counts =
    activeView === "randevular"
      ? await getCounts()
      : { randevular: 0, stok: 0 };
  const lastikler = activeView === "stok" ? await getLastikler() : [];
  const randevular = activeView === "randevular" ? await getRandevular() : [];
  const urunler = activeView === "urunler" ? await getUrunler() : [];
  const hizmetler = activeView === "hizmetler" ? await getHizmetler() : [];
  const ayarlar = activeView === "ayarlar" ? await getAyarlar() : null;
  const summaryCards =
    activeView === "randevular"
      ? [
        {
          title: "Toplam Randevu",
          value: String(counts.randevular),
          status: "Canlı"
        }
      ]
      : [];
  return (
    <div className="min-h-screen bg-[#0f172a] bg-[url('/otolastik.png')] bg-cover bg-center bg-no-repeat bg-fixed text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col gap-6 border-r border-white/10 bg-[#0f172a]/95 backdrop-blur-md px-6 py-8 md:flex shadow-2xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Yönetici Paneli
            </p>
            <p className="mt-2 text-lg font-semibold">OtoRandevu</p>
          </div>
          <nav className="flex flex-col gap-3 text-sm text-white/70">
            {[
              { label: "Randevular", href: "/admin?view=randevular" },
              { label: "Hizmetler", href: "/admin?view=hizmetler" },
              { label: "Stok Yönetimi", href: "/admin?view=stok" },
              { label: "Ürünler", href: "/admin?view=urunler" },
              { label: "Ayarlar", href: "/admin?view=ayarlar" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-xl px-4 py-3 hover:bg-white/5 hover:text-white ${(item.href.includes("view=randevular") && activeView === "randevular") ||
                  (item.href.includes("view=hizmetler") && activeView === "hizmetler") ||
                  (item.href.includes("view=stok") && activeView === "stok") ||
                  (item.href.includes("view=urunler") && activeView === "urunler") ||
                  (item.href.includes("view=ayarlar") && activeView === "ayarlar")
                  ? "bg-white/10 text-white"
                  : ""
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="mt-auto rounded-xl bg-white/5 px-4 py-3 text-sm text-white/70">
            Çıkış
          </button>
        </aside>

        <main className="flex-1 px-6 py-8 md:px-10 bg-[#0f172a]/90 backdrop-blur-sm">
          <div className="flex flex-col gap-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Yönetici Paneli
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                {activeView === "randevular"
                  ? "Randevular"
                  : activeView === "hizmetler"
                    ? "Hizmetler"
                    : activeView === "stok"
                      ? "Stok Yönetimi"
                      : activeView === "urunler"
                        ? "Ürünler"
                        : "Ayarlar"}
              </h1>
              <p className="mt-2 text-xs text-white/50">
                Supabase: {supabaseUrl || "Bilinmiyor"}
              </p>
              {activeView === "stok" ? (
                <p className="mt-1 text-xs text-white/50">
                  Lastik sayısı: {lastikler.length}
                </p>
              ) : null}
            </div>

            {activeView === "randevular" ? (
              <section className="grid gap-4 lg:grid-cols-3">
                {summaryCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>{card.title}</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                        {card.status}
                      </span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-white">
                      {card.value}
                    </p>
                  </div>
                ))}
              </section>
            ) : null}

            {/* Stok sayfasında sadece stok bilgileri gösterilir. */}

            {activeView === "stok" ? (
              <section
                id="stok-yonetimi"
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Lastik Stok
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Yeni lastik ekle
                    </p>
                  </div>
                </div>
                {lastikStatus === "1" ? (
                  <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Lastik başarıyla kaydedildi.
                    {insertedId ? ` ID: ${insertedId}` : ""}
                  </p>
                ) : null}
                {lastikStatus === "0" ? (
                  <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {errorMessage || "Kayıt sırasında hata oluştu."}
                  </p>
                ) : null}
                <form
                  action={createLastik}
                  className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-brand-night/60 p-4 lg:grid-cols-6"
                >
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Genişlik
                    <input
                      name="genislik"
                      required
                      className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Yanak
                    <input
                      name="yanak"
                      required
                      className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Jant
                    <input
                      name="jant"
                      required
                      className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Marka
                    <input
                      name="marka"
                      required
                      className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Özellik
                    <input
                      name="ozellik"
                      required
                      className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Durum
                    <select
                      name="durum"
                      required
                      className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                    >
                      <option value="">Seçiniz</option>
                      <option value="sıfır">Sıfır</option>
                      <option value="2.el">2. El</option>
                    </select>
                  </label>
                  <div className="lg:col-span-6">
                    <button className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                      Kaydet
                    </button>
                  </div>
                </form>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {lastikler.map((lastik) => (
                    <div
                      key={lastik.id}
                      className="rounded-xl border border-white/10 bg-brand-night/60 p-4 text-sm text-white/80"
                    >
                      <p className="text-base font-semibold text-white">
                        {lastik.genislik}/{lastik.yanak} R{lastik.jant}
                      </p>
                      <p className="mt-1 text-white/60">
                        {lastik.marka ?? "Marka yok"} · {lastik.ozellik ?? "Özellik yok"}
                      </p>
                      <p className="mt-1 text-white/60">
                        Durum: {lastik.durum ?? "-"}
                      </p>
                    </div>
                  ))}
                  {lastikler.length === 0 ? (
                    <p className="text-sm text-white/50">
                      Henüz kayıtlı lastik yok.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeView === "urunler" ? (
              <section
                id="urunler"
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Ürünler
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Ürün listesi
                    </p>
                  </div>
                  <Link
                    href="/admin?view=urunler&urunEkle=1#urun-ekle"
                    className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                  >
                    Yeni ürün ekle
                  </Link>
                </div>

                {urunStatus === "1" ? (
                  <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Ürün başarıyla kaydedildi.
                  </p>
                ) : null}
                {urunStatus === "0" ? (
                  <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {errorMessage || "Ürün kaydedilemedi."}
                  </p>
                ) : null}

                <details
                  id="urun-ekle"
                  className="mt-6 rounded-2xl border border-white/10 bg-brand-night/60 p-4"
                  open={isUrunFormOpen}
                >
                  <summary className="cursor-pointer text-sm font-semibold text-white">
                    Yeni ürün ekle
                  </summary>
                  <form
                    action={createUrun}
                    className="mt-4 grid gap-4 lg:grid-cols-3"
                  >
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Ürün Adı
                      <input
                        name="ad"
                        required
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Fiyat (₺)
                      <input
                        name="fiyat"
                        type="number"
                        step="0.01"
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Fotoğraf
                      <input
                        name="gorsel"
                        type="file"
                        accept="image/*"
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-3">
                      Açıklama (opsiyonel)
                      <textarea
                        name="aciklama"
                        rows={3}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <div className="lg:col-span-3">
                      <button className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                        Kaydet
                      </button>
                    </div>
                  </form>
                </details>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {urunler.map((urun) => (
                    <details
                      key={urun.id}
                      className="rounded-xl border border-white/10 bg-brand-night/60 p-4"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {urun.image_url ? (
                              <img
                                src={urun.image_url}
                                alt={urun.name}
                                className="h-14 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-lg border border-white/10 bg-white/5" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {urun.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {urun.fiyat ? `₺${urun.fiyat}` : "Fiyat belirtilmedi"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-white/50">Düzenle</span>
                        </div>
                      </summary>

                      <form
                        action={updateUrun}
                        className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 lg:grid-cols-2"
                      >
                        <input type="hidden" name="id" value={urun.id} />
                        <input
                          type="hidden"
                          name="current_image_path"
                          value={urun.image_path ?? ""}
                        />
                        <label className="flex flex-col gap-2 text-sm text-white/70">
                          Ürün Adı
                          <input
                            name="ad"
                            defaultValue={urun.name}
                            required
                            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-white/70">
                          Fiyat (₺)
                          <input
                            name="fiyat"
                            type="number"
                            step="0.01"
                            defaultValue={urun.fiyat ?? ""}
                            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                          Fotoğraf (değiştir)
                          <input
                            name="gorsel"
                            type="file"
                            accept="image/*"
                            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                          />
                        </label>
                        <div className="lg:col-span-2 flex flex-wrap gap-3">
                          <button className="flex-1 rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                            Güncelle
                          </button>
                        </div>
                      </form>

                      <form action={deleteUrun} className="mt-3">
                        <input type="hidden" name="id" value={urun.id} />
                        <input
                          type="hidden"
                          name="image_path"
                          value={urun.image_path ?? ""}
                        />
                        <button className="w-full rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
                          Sil
                        </button>
                      </form>
                    </details>
                  ))}
                  {urunler.length === 0 ? (
                    <p className="text-sm text-white/50">Henüz kayıtlı ürün yok.</p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeView === "hizmetler" ? (
              <section
                id="hizmetler"
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Hizmetler
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white">
                      Hizmet listesi
                    </h2>
                  </div>
                  <form action={seedHizmetler}>
                    <button className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                      Varsayılan hizmetleri ekle
                    </button>
                  </form>
                  {hizmetStatus === "1" ? (
                    <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                      Hizmet kaydedildi.
                    </p>
                  ) : null}
                  {hizmetStatus === "0" ? (
                    <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {errorMessage || "Hizmet kaydedilemedi."}
                    </p>
                  ) : null}
                  <form
                    action={createHizmet}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-brand-night/60 p-4 lg:grid-cols-2"
                  >
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Hizmet Adı
                      <input
                        name="ad"
                        required
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Süre (dk)
                      <input
                        name="sure_dk"
                        type="number"
                        min="0"
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                      Açıklama
                      <textarea
                        name="aciklama"
                        rows={3}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                      Fotoğraf
                      <input
                        name="gorsel"
                        type="file"
                        accept="image/*"
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <div className="lg:col-span-2">
                      <button className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                        Kaydet
                      </button>
                    </div>
                  </form>
                  <div className="grid gap-4 md:grid-cols-2">
                    {hizmetler.map((hizmet) => (
                      <details
                        key={hizmet.id}
                        className="rounded-xl border border-white/10 bg-brand-night/60 p-4"
                      >
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-white">
                                {hizmet.name}
                              </p>
                              {typeof hizmet.duration === "number" ? (
                                <p className="mt-1 text-xs text-white/50">
                                  Süre: {hizmet.duration} dk
                                </p>
                              ) : null}
                            </div>
                            <span className="text-xs text-white/50">Düzenle</span>
                          </div>
                        </summary>

                        {hizmet.image_url ? (
                          <img
                            src={hizmet.image_url}
                            alt={hizmet.name}
                            className="mt-4 h-40 w-full rounded-lg object-cover"
                          />
                        ) : null}

                        <form
                          action={updateHizmet}
                          className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 lg:grid-cols-2"
                        >
                          <input type="hidden" name="id" value={hizmet.id} />
                          <input
                            type="hidden"
                            name="current_image_path"
                            value={hizmet.image_path ?? ""}
                          />
                          <label className="flex flex-col gap-2 text-sm text-white/70">
                            Hizmet Adı
                            <input
                              name="ad"
                              defaultValue={hizmet.name}
                              required
                              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-white/70">
                            Süre (dk)
                            <input
                              name="sure_dk"
                              type="number"
                              min="0"
                              defaultValue={hizmet.duration ?? ""}
                              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                            Açıklama
                            <textarea
                              name="aciklama"
                              rows={3}
                              defaultValue={hizmet.description ?? ""}
                              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                            Fotoğraf (değiştir)
                            <input
                              name="gorsel"
                              type="file"
                              accept="image/*"
                              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                            />
                          </label>
                          <div className="lg:col-span-2 flex flex-wrap gap-3">
                            <button className="flex-1 rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                              Güncelle
                            </button>
                          </div>
                        </form>

                        <form action={deleteHizmet} className="mt-3">
                          <input type="hidden" name="id" value={hizmet.id} />
                          <input
                            type="hidden"
                            name="gorsel_path"
                            value={hizmet.image_path ?? ""}
                          />
                          <button className="w-full rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
                            Sil
                          </button>
                        </form>
                      </details>
                    ))}
                    {hizmetler.length === 0 ? (
                      <p className="text-sm text-white/50">
                        Henüz kayıtlı hizmet yok.
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "randevular" ? (
              <section
                id="randevular"
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Randevular
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Gelen randevular
                    </p>
                  </div>
                </div>
                {randevuStatus === "1" ? (
                  <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Randevu silindi.
                  </p>
                ) : null}
                {randevuStatus === "0" ? (
                  <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {errorMessage || "Randevu güncellenemedi."}
                  </p>
                ) : null}
                <div className="mt-6 space-y-4">
                  {randevular.map((randevu) => (
                    <details
                      key={randevu.id}
                      className="rounded-xl border border-white/10 bg-brand-night/60 p-4"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div>
                            <p className="text-base font-semibold text-white">
                              {randevu.ad} · {randevu.telefon}
                            </p>
                            <p className="mt-1 text-sm text-white/60">
                              {randevu.hizmet} · {randevu.tarih} {randevu.saat}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-white/60">Durum</p>
                            <p className="text-lg font-semibold text-white">
                              Aktif
                            </p>
                          </div>
                        </div>
                      </summary>
                      <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/70">
                        <p className="text-white/60">Ad Soyad: {randevu.ad}</p>
                        <p className="mt-1 text-white/60">Telefon: {randevu.telefon}</p>
                        <p className="mt-1 text-white/60">
                          Hizmet: {randevu.hizmet}
                        </p>
                        <p className="mt-1 text-white/60">
                          Tarih/Saat: {randevu.tarih} {randevu.saat}
                        </p>
                        {randevu.email ? (
                          <p className="mt-1 text-white/60">Email: {randevu.email}</p>
                        ) : null}
                        {randevu.plaka ? (
                          <p className="mt-1 text-white/60">Plaka: {randevu.plaka}</p>
                        ) : null}
                        {randevu.not_metni ? (
                          <p className="mt-2 text-white/70">Not: {randevu.not_metni}</p>
                        ) : null}
                        <form action={cancelRandevu} className="mt-4">
                          <input type="hidden" name="id" value={randevu.id} />
                          <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
                            İptal et
                          </button>
                        </form>
                      </div>
                    </details>
                  ))}
                  {randevular.length === 0 ? (
                    <p className="text-sm text-white/50">
                      Henüz randevu yok.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}
            {activeView === "ayarlar" ? (
              <section
                id="ayarlar"
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      İşletme Ayarları
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white">
                      Çalışma saatleri ve iletişim
                    </h2>
                  </div>
                  {ayarlarStatus === "1" ? (
                    <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                      Ayarlar güncellendi.
                    </p>
                  ) : null}
                  {errorMessage ? (
                    <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {errorMessage}
                    </p>
                  ) : null}
                  <form action={updateAyarlar} className="grid gap-4 lg:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Hafta içi (Pzt - Cuma)
                      <input
                        name="hafta_ici"
                        defaultValue={ayarlar?.hafta_ici ?? "09:00 - 18:00"}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Cumartesi
                      <input
                        name="cumartesi"
                        defaultValue={ayarlar?.cumartesi ?? "09:00 - 16:00"}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Pazar
                      <input
                        name="pazar"
                        defaultValue={ayarlar?.pazar ?? "Kapalı"}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70">
                      Telefon
                      <input
                        name="telefon"
                        defaultValue={ayarlar?.telefon ?? ""}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                      WhatsApp
                      <input
                        name="whatsapp"
                        defaultValue={ayarlar?.whatsapp ?? ""}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
                      Adres
                      <textarea
                        name="adres"
                        rows={3}
                        defaultValue={ayarlar?.adres ?? ""}
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
                      />
                    </label>
                    <div className="lg:col-span-2">
                      <button className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft">
                        Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </div>
      e    </div>
  );
}
