import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  getLastikler,
  getRandevular,
  getUrunler,
  deleteRandevu,
  getAyarlar,
  getHizmetler,
  updateRandevuStatus,
  deleteLastik
} from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/authEdge";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import RandevuSekmeleri from "@/components/admin/RandevuSekmeleri";
import LinkBekleme from "@/components/LinkBekleme";
import SelectionWithOther from "@/components/admin/SelectionWithOther";
import SmartTireSize from "@/components/admin/SmartTireSize";

export const dynamic = "force-dynamic";

async function createLastik(formData: FormData) {
  "use server";
  await requireAdmin();

  const genislikSelect = String(formData.get("genislik_select") ?? "");
  const genislik = genislikSelect === "Diğer" ? String(formData.get("genislik_other") ?? "").trim() : genislikSelect;

  const yanakSelect = String(formData.get("yanak_select") ?? "");
  const yanak = yanakSelect === "Diğer" ? String(formData.get("yanak_other") ?? "").trim() : yanakSelect;

  const jantSelect = String(formData.get("jant_select") ?? "");
  const jant = jantSelect === "Diğer" ? String(formData.get("jant_other") ?? "").trim() : jantSelect;

  const markaSelect = String(formData.get("marka_select") ?? "");
  const marka = markaSelect === "Diğer" ? String(formData.get("marka_other") ?? "").trim() : markaSelect;

  const ozellikSelect = String(formData.get("ozellik_select") ?? "");
  const ozellik = ozellikSelect === "Diğer" ? String(formData.get("ozellik_other") ?? "").trim() : ozellikSelect;

  const durum = String(formData.get("durum") ?? "").trim();
  const gorsel = formData.get("gorsel");

  if (!genislik || !yanak || !jant || !marka || !ozellik || !durum) {
    redirect("/admin?view=stok&lastik=0&error=Eksik%20bilgi");
  }

  const supabase = getSupabaseServerClient();
  let image_url: string | null = null;
  let image_path: string | null = null;

  if (gorsel instanceof File && gorsel.size > 0) {
    const extension = gorsel.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = fileName; // Artık kök dizine kaydedebiliriz veya 'lastikler/' klasörünü tutabiliriz.
    const { error: uploadError } = await supabase.storage
      .from("tire")
      .upload(filePath, gorsel, {
        cacheControl: "3600",
        upsert: false,
        contentType: gorsel.type || "image/png"
      });
    if (uploadError) {
      redirect(
        `/admin?view=stok&lastik=0&error=${encodeURIComponent(uploadError.message)}`
      );
    }
    const { data: urlData } = supabase.storage.from("tire").getPublicUrl(filePath);
    image_url = urlData.publicUrl;
    image_path = filePath;
  }

  const payload = {
    genislik: genislik || null,
    yanak: yanak || null,
    jant: jant || null,
    marka: marka || null,
    ozellik: ozellik || null,
    durum: durum || null,
    image_url,
    image_path
  };

  const { data, error } = await supabase
    .from("lastikler")
    .insert([payload])
    .select("id")
    .single();

  if (error) {
    redirect(`/admin?view=stok&lastik=0&error=${encodeURIComponent(error.message)}`);
  }
  if (!data?.id) {
    redirect("/admin?view=stok&lastik=0&error=Kayit%20donmedi");
  }
  redirect(`/admin?view=stok&lastik=1&id=${data.id}`);
}
async function deleteLastikAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const image_path = String(formData.get("image_path") ?? "");
  if (!id) return;

  const supabase = getSupabaseServerClient();

  // Storage'dan sil
  if (image_path) {
    await supabase.storage.from("tire").remove([image_path]);
  }

  const result = await deleteLastik(id);
  if (result.ok) {
    revalidatePath("/admin");
    redirect("/admin?view=stok&lastik=Silindi");
  }
}
async function cancelRandevu(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin?randevu=0&error=Randevu%20bulunamadi");
  }
  const result = await updateRandevuStatus(id, "iptal");
  if (!result.ok) {
    redirect(`/admin?randevu=0&error=${encodeURIComponent(result.message ?? "")}`);
  }
  revalidatePath("/admin");
  redirect(`/admin?randevu=1&id=${id}&view=randevular`);
}

async function handleDeleteRandevu(id: string) {
  "use server";
  await requireAdmin();
  const result = await deleteRandevu(id);
  if (result.ok) {
    revalidatePath("/admin");
  }
}
async function handleCalendarCancel(id: string) {
  "use server";
  await requireAdmin();
  await updateRandevuStatus(id, "iptal");
  revalidatePath("/admin");
}

async function createUrun(formData: FormData) {
  "use server";
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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

async function handleLogout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  redirect("/admin/login");
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
    tab?: string;
  }>;
}) {
  await requireAdmin();
  const resolvedParams = searchParams ? await searchParams : undefined;
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
  const activeTab = resolvedParams?.tab ?? "bugun";
  // Sadece açık bölümün verisi çekilir; sorgular sırayla değil aynı anda çalışır
  const [lastikler, randevularRaw, urunler, hizmetler, ayarlar] = await Promise.all([
    activeView === "stok" ? getLastikler() : [],
    activeView === "randevular" ? getRandevular() : [],
    activeView === "urunler" ? getUrunler() : [],
    activeView === "hizmetler" || activeView === "randevular" ? getHizmetler() : [],
    activeView === "ayarlar" ? getAyarlar() : null
  ]);

  const menu = [
    { label: "Randevular", view: "randevular" },
    { label: "Hizmetler", view: "hizmetler" },
    { label: "Stok", view: "stok" },
    { label: "Ürünler", view: "urunler" },
    { label: "Ayarlar", view: "ayarlar" }
  ];
  const baslik = {
    randevular: "Randevular",
    hizmetler: "Hizmetler",
    stok: "Stok Yönetimi",
    urunler: "Ürünler",
    ayarlar: "Ayarlar"
  }[activeView] ?? "Ayarlar";

  return (
    // Sitedeki tasarımla aynı: asfalt siyahı zemin, tabela sarısı vurgu
    <div className="min-h-screen text-brand-text">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r border-white/[0.07] bg-[#171614] px-5 py-8 md:sticky md:top-0 md:flex md:h-screen">
          <Link href="/" className="flex items-center px-2">
            <Image
              src="/logo.svg"
              alt="Fırat Oto Lastik logo"
              width={180}
              height={60}
              className="h-11 w-auto object-contain"
            />
          </Link>
          <nav className="flex flex-col gap-1.5 text-[15px] font-semibold">
            {menu.map((item) => (
              <Link
                key={item.view}
                href={`/admin?view=${item.view}`}
                className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${activeView === item.view
                  ? "bg-brand-gold text-brand-dark"
                  : "text-brand-text/75 hover:bg-white/5 hover:text-brand-gold"
                  }`}
              >
                {item.label}
                <LinkBekleme />
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              Siteyi görüntüle ↗
            </Link>
            <form action={handleLogout}>
              <button type="submit" className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-brand-muted transition-colors hover:border-white/20 hover:text-brand-text">
                Çıkış yap
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Telefonda: logo + çıkış, altında kaydırılabilir menü (yan menü sadece geniş ekranda) */}
          <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-brand-dark/90 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/">
                <Image src="/logo.svg" alt="Fırat Oto Lastik logo" width={140} height={36} className="h-9 w-auto object-contain" />
              </Link>
              <form action={handleLogout}>
                <button type="submit" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-brand-muted">
                  Çıkış
                </button>
              </form>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-3 text-sm font-semibold [scrollbar-width:none]">
              {menu.map((item) => (
                <Link
                  key={item.view}
                  href={`/admin?view=${item.view}`}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 transition-colors ${activeView === item.view
                    ? "bg-brand-gold text-brand-dark"
                    : "bg-white/5 text-brand-text/80"
                    }`}
                >
                  {item.label}
                  <LinkBekleme yerTut={false} className="-mr-1" />
                </Link>
              ))}
            </nav>
          </header>

          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12">
            <div>
              <p className="text-sm font-semibold text-brand-gold">Yönetici Paneli</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-brand-text sm:text-5xl">{baslik}</h1>
              {activeView === "stok" ? (
                <p className="mt-2 text-sm text-brand-muted">Kayıtlı lastik: {lastikler.length}</p>
              ) : null}
            </div>

            {activeView === "randevular" ? (
              <RandevuSekmeleri
                randevular={randevularRaw}
                hizmetler={hizmetler}
                ilkSekme={activeTab}
                onCancel={handleCalendarCancel}
                onDelete={handleDeleteRandevu}
                bildirim={
                  randevuStatus === "1" ? (
                    <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                      Randevu silindi.
                    </p>
                  ) : randevuStatus === "0" ? (
                    <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {errorMessage || "Randevu güncellenemedi."}
                    </p>
                  ) : null
                }
              />
            ) : null}

            {/* Stok sayfasında sadece stok bilgileri gösterilir. */}

            {activeView === "stok" ? (
              <section
                id="stok-yonetimi"
                className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-gold">
                      Lastik Stok
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold text-brand-text [font-stretch:112%]">
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
                  className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-brand-dark/50 p-4 lg:grid-cols-6"
                >
                  <SmartTireSize />
                  <SelectionWithOther
                    name="marka"
                    label="Marka"
                    required
                    options={[
                      "Lassa", "Petlas", "Starmaxx", "Michelin", "Bridgestone",
                      "Goodyear", "Continental", "Pirelli", "Dunlop", "Hankook",
                      "Falken", "Kumho", "Yokohama", "Milestone", "Waterfall", "Sava"
                    ]}
                  />
                  <SelectionWithOther
                    name="ozellik"
                    label="Özellik"
                    required
                    options={["Kışlık", "Yazlık", "Dört Mevsim", "RunFlat"]}
                  />
                  <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                    Durum
                    <select
                      name="durum"
                      required
                      className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                    >
                      <option value="">Seçiniz</option>
                      <option value="sıfır">Sıfır</option>
                      <option value="2.el">2. El</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-6">
                    Lastik Fotoğrafı
                    <input
                      name="gorsel"
                      type="file"
                      accept="image/*"
                      className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold file:mr-4 file:rounded-full file:border-0 file:bg-brand-gold/10 file:px-4 file:py-1 file:text-xs file:font-bold file:text-brand-gold hover:file:bg-brand-gold/20"
                    />
                  </label>
                  <div className="lg:col-span-6">
                    <button className="w-full rounded-full bg-brand-gold px-6 py-3 text-sm font-black text-brand-dark hover:-translate-y-0.5 transition-all active:scale-95">
                      Kaydet
                    </button>
                  </div>
                </form>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {lastikler.map((lastik) => (
                    <div
                      key={lastik.id}
                      className="group rounded-xl border border-white/10 bg-brand-dark/50 p-4 text-sm text-white/80 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start gap-4">
                          {lastik.image_url ? (
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                              <Image
                                src={lastik.image_url}
                                alt={`${lastik.marka} ${lastik.genislik}/${lastik.yanak} R${lastik.jant}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="text-base font-bold text-brand-text group-hover:text-brand-gold transition-colors">
                              {lastik.genislik}/{lastik.yanak} R{lastik.jant}
                            </p>
                            <p className="mt-1 text-brand-muted">
                              {lastik.marka ?? "Marka yok"} · {lastik.ozellik ?? "Özellik yok"}
                            </p>
                            <p className="mt-1 text-brand-muted">
                              Durum: <span className="font-bold text-white/90">{lastik.durum ?? "-"}</span>
                            </p>
                          </div>
                        </div>
                        <form action={deleteLastikAction}>
                          <input type="hidden" name="id" value={lastik.id} />
                          <input type="hidden" name="image_path" value={lastik.image_path ?? ""} />
                          <button
                            className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-brand-text transition-all active:scale-90"
                            title="Sil"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                  {lastikler.length === 0 ? (
                    <p className="text-sm text-brand-muted">
                      Henüz kayıtlı lastik yok.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeView === "urunler" ? (
              <section
                id="urunler"
                className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-gold">
                      Ürünler
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold text-brand-text [font-stretch:112%]">
                      Ürün listesi
                    </p>
                  </div>
                  <Link
                    href="/admin?view=urunler&urunEkle=1#urun-ekle"
                    className="rounded-full border border-brand-gold/50 bg-brand-gold/10 px-4 py-2 text-sm font-bold text-brand-gold hover:bg-brand-gold/20 transition-all"
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
                  className="mt-6 rounded-2xl border border-white/10 bg-brand-dark/50 p-4"
                  open={isUrunFormOpen}
                >
                  <summary className="cursor-pointer text-sm font-semibold text-brand-text">
                    Yeni ürün ekle
                  </summary>
                  <form
                    action={createUrun}
                    className="mt-4 grid gap-4 lg:grid-cols-3"
                  >
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Ürün Adı
                      <input
                        name="ad"
                        required
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Fiyat (₺)
                      <input
                        name="fiyat"
                        type="number"
                        step="0.01"
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Fotoğraf
                      <input
                        name="gorsel"
                        type="file"
                        accept="image/*"
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold file:mr-4 file:rounded-full file:border-0 file:bg-brand-gold/10 file:px-4 file:py-1 file:text-xs file:font-bold file:text-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-3">
                      Açıklama (opsiyonel)
                      <textarea
                        name="aciklama"
                        rows={3}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <div className="lg:col-span-3">
                      <button className="w-full rounded-full bg-brand-gold px-6 py-3 text-sm font-black text-brand-dark hover:-translate-y-0.5 transition-all active:scale-95">
                        Kaydet
                      </button>
                    </div>
                  </form>
                </details>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {urunler.map((urun) => (
                    <details
                      key={urun.id}
                      className="group rounded-xl border border-white/10 bg-brand-dark/50 p-4 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {urun.image_url ? (
                              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/10">
                                <Image
                                  src={urun.image_url}
                                  alt={urun.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-lg border border-white/10 bg-white/5" />
                            )}
                            <div>
                              <p className="text-sm font-bold text-brand-text group-hover:text-brand-gold transition-colors">
                                {urun.name}
                              </p>
                              <p className="text-xs text-brand-muted">
                                {urun.fiyat ? `₺${urun.fiyat}` : "Fiyat belirtilmedi"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-brand-gold transition-colors">Düzenle</span>
                        </div>
                      </summary>

                      <form
                        action={updateUrun}
                        className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-brand-dark/50 p-4 lg:grid-cols-2"
                      >
                        <input type="hidden" name="id" value={urun.id} />
                        <input
                          type="hidden"
                          name="current_image_path"
                          value={urun.image_path ?? ""}
                        />
                        <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                          Ürün Adı
                          <input
                            name="ad"
                            defaultValue={urun.name}
                            required
                            className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                          Fiyat (₺)
                          <input
                            name="fiyat"
                            type="number"
                            step="0.01"
                            defaultValue={urun.fiyat ?? ""}
                            className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                          Fotoğraf (değiştir)
                          <input
                            name="gorsel"
                            type="file"
                            accept="image/*"
                            className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold file:mr-4 file:rounded-full file:border-0 file:bg-brand-gold/10 file:px-4 file:py-1 file:text-xs file:font-bold file:text-brand-gold"
                          />
                        </label>
                        <div className="lg:col-span-2 flex flex-wrap gap-3">
                          <button className="flex-1 rounded-full bg-brand-gold px-6 py-3 text-sm font-black text-brand-dark hover:-translate-y-0.5 transition-all active:scale-95">
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
                        <button className="w-full rounded-full border border-red-500/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400/70 hover:bg-red-500/10 transition-all">
                          Ürünü Sil
                        </button>
                      </form>
                    </details>
                  ))}
                  {urunler.length === 0 ? (
                    <p className="text-sm text-brand-muted">Henüz kayıtlı ürün yok.</p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeView === "hizmetler" ? (
              <section
                id="hizmetler"
                className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-semibold text-brand-gold">
                      Hizmetler
                    </p>
                    <h2 className="mt-1 font-display text-xl font-extrabold text-brand-text [font-stretch:112%]">
                      Hizmet listesi
                    </h2>
                  </div>
                  <form action={seedHizmetler}>
                    <button className="w-full rounded-full border border-brand-gold/50 bg-brand-gold/5 px-6 py-3 text-sm font-bold text-brand-gold hover:bg-brand-gold/10 transition-all">
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
                    className="grid gap-4 rounded-2xl border border-white/10 bg-brand-dark/50 p-4 lg:grid-cols-2"
                  >
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Hizmet Adı
                      <input
                        name="ad"
                        required
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Süre (dk)
                      <input
                        name="sure_dk"
                        type="number"
                        min="0"
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                      Açıklama
                      <textarea
                        name="aciklama"
                        rows={3}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                      Fotoğraf
                      <input
                        name="gorsel"
                        type="file"
                        accept="image/*"
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold file:mr-4 file:rounded-full file:border-0 file:bg-brand-gold/10 file:px-4 file:py-1 file:text-xs file:font-bold file:text-brand-gold"
                      />
                    </label>
                    <div className="lg:col-span-2">
                      <button className="w-full rounded-full bg-brand-gold px-6 py-3 text-sm font-black text-brand-dark hover:-translate-y-0.5 transition-all active:scale-95">
                        Kaydet
                      </button>
                    </div>
                  </form>
                  <div className="grid gap-4 md:grid-cols-2">
                    {hizmetler.map((hizmet) => (
                      <details
                        key={hizmet.id}
                        className="group rounded-xl border border-white/10 bg-brand-dark/50 p-4 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all"
                      >
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-bold text-brand-text group-hover:text-brand-gold transition-colors">
                                {hizmet.name}
                              </p>
                              {typeof hizmet.duration === "number" ? (
                                <p className="mt-1 text-xs text-brand-muted">
                                  Süre: {hizmet.duration} dk
                                </p>
                              ) : null}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-brand-gold transition-colors">Düzenle</span>
                          </div>
                        </summary>

                        {hizmet.image_url ? (
                          <div className="relative mt-4 h-40 w-full overflow-hidden rounded-lg">
                            <Image
                              src={hizmet.image_url}
                              alt={hizmet.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : null}

                        <form
                          action={updateHizmet}
                          className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-brand-dark/50 p-4 lg:grid-cols-2"
                        >
                          <input type="hidden" name="id" value={hizmet.id} />
                          <input
                            type="hidden"
                            name="current_image_path"
                            value={hizmet.image_path ?? ""}
                          />
                          <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                            Hizmet Adı
                            <input
                              name="ad"
                              defaultValue={hizmet.name}
                              required
                              className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                            Süre (dk)
                            <input
                              name="sure_dk"
                              type="number"
                              min="0"
                              defaultValue={hizmet.duration ?? ""}
                              className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                            Açıklama
                            <textarea
                              name="aciklama"
                              rows={3}
                              defaultValue={hizmet.description ?? ""}
                              className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                            Fotoğraf (değiştir)
                            <input
                              name="gorsel"
                              type="file"
                              accept="image/*"
                              className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold file:mr-4 file:rounded-full file:border-0 file:bg-brand-gold/10 file:px-4 file:py-1 file:text-xs file:font-bold file:text-brand-gold"
                            />
                          </label>
                          <div className="lg:col-span-2 flex flex-wrap gap-3">
                            <button className="flex-1 rounded-full bg-brand-gold px-6 py-3 text-sm font-black text-brand-dark hover:-translate-y-0.5 transition-all active:scale-95">
                              Güncellemeyi Kaydet
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
                          <button className="w-full rounded-full border border-red-500/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400/70 hover:bg-red-500/10 transition-all">
                            Hizmeti Sil
                          </button>
                        </form>
                      </details>
                    ))}
                    {hizmetler.length === 0 ? (
                      <p className="text-sm text-brand-muted">
                        Henüz kayıtlı hizmet yok.
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "ayarlar" ? (
              <section
                id="ayarlar"
                className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-semibold text-brand-gold">
                      İşletme Ayarları
                    </p>
                    <h2 className="mt-1 font-display text-xl font-extrabold text-brand-text [font-stretch:112%]">
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
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Hafta içi (Pzt - Cuma)
                      <input
                        name="hafta_ici"
                        defaultValue={ayarlar?.hafta_ici ?? "09:00 - 18:00"}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                      <span className="text-xs text-brand-muted">Örnek: 07:30 - 20:00 · Randevu takvimi bu saatlere göre açılır</span>
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Cumartesi
                      <input
                        name="cumartesi"
                        defaultValue={ayarlar?.cumartesi ?? "09:00 - 16:00"}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Pazar
                      <input
                        name="pazar"
                        defaultValue={ayarlar?.pazar ?? "Kapalı"}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                      <span className="text-xs text-brand-muted">Kapalı günler için &quot;Kapalı&quot; yazın</span>
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70">
                      Telefon
                      <input
                        name="telefon"
                        defaultValue={ayarlar?.telefon ?? ""}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                      WhatsApp
                      <input
                        name="whatsapp"
                        defaultValue={ayarlar?.whatsapp ?? ""}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-brand-text/70 lg:col-span-2">
                      Adres
                      <textarea
                        name="adres"
                        rows={3}
                        defaultValue={ayarlar?.adres ?? ""}
                        className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
                      />
                    </label>
                    <div className="lg:col-span-2">
                      <button className="w-full rounded-full bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5">
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
