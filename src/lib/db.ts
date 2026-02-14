import { getSupabaseServerClient } from "@/lib/supabase";

export type HizmetRow = {
  id: string;
  name: string;
  duration: number | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
};

export type UrunRow = {
  id: string;
  name: string;
  fiyat: number | null;
  image_url: string | null;
  image_path: string | null;
};

export type LastikRow = {
  id: string;
  genislik: string | null;
  yanak: string | null;
  jant: string | null;
  marka: string | null;
  ozellik: string | null;
  durum: string | null;
  image_url: string | null;
  image_path: string | null;
};

export type RandevuRow = {
  id: string;
  ad: string;
  telefon: string;
  email: string | null;
  plaka: string | null;
  hizmet: string;
  tarih: string;
  saat: string;
  not_metni: string | null;
  durum: string;
  created_at: string;
};

export type AyarlarRow = {
  id: number;
  hafta_ici: string | null;
  cumartesi: string | null;
  pazar: string | null;
  adres: string | null;
  telefon: string | null;
  whatsapp: string | null;
};

export type LastikFilters = {
  genislik?: string;
  yanak?: string;
  jant?: string;
  marka?: string;
  ozellik?: string;
  durum?: string;
};

export async function getHizmetler() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, duration, description, image_url, image_path")
    .order("name", { ascending: true });
  if (error) {
    return [];
  }
  return (data ?? []) as HizmetRow[];
}

export async function getUrunler() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, fiyat, image_url, image_path")
    .order("name", { ascending: true });
  if (error) {
    return [];
  }
  return (data ?? []) as UrunRow[];
}

export async function getLastikler() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("lastikler")
    .select("id, genislik, yanak, jant, marka, ozellik, durum, image_url, image_path");
  if (error) {
    return [];
  }
  return (data ?? []) as LastikRow[];
}

export async function searchLastikler(filters: LastikFilters) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("lastikler")
    .select("id, genislik, yanak, jant, marka, ozellik, durum, image_url, image_path");

  if (filters.genislik) {
    query = query.eq("genislik", filters.genislik);
  }
  if (filters.yanak) {
    query = query.eq("yanak", filters.yanak);
  }
  if (filters.jant) {
    query = query.eq("jant", filters.jant);
  }
  if (filters.marka) {
    query = query.eq("marka", filters.marka);
  }
  if (filters.ozellik) {
    query = query.eq("ozellik", filters.ozellik);
  }
  if (filters.durum) {
    query = query.eq("durum", filters.durum);
  }

  const { data, error } = await query;
  if (error) {
    return [];
  }
  return (data ?? []) as LastikRow[];
}

export async function getRandevular() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("randevular")
    .select(
      "id, ad, telefon, email, plaka, hizmet, tarih, saat, not_metni, durum, created_at"
    )
    .order("created_at", { ascending: false });
  if (error) {
    return [];
  }
  return (data ?? []) as RandevuRow[];
}

export async function searchRandevular(ad: string, plaka: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("randevular")
    .select(
      "id, ad, telefon, email, plaka, hizmet, tarih, saat, not_metni, durum, created_at"
    )
    .ilike("ad", ad.trim())
    .ilike("plaka", plaka.trim());

  if (error) {
    return [];
  }
  // ilike boş string eşleşmesi istemezsek trim kontrolü üstte yapıldı; burada da filtrelenmiş.
  return (data ?? []) as RandevuRow[];
}

export async function getAyarlar() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ayarlar")
    .select("id, hafta_ici, cumartesi, pazar, adres, telefon, whatsapp")
    .eq("id", 1)
    .single();
  if (error) {
    return null;
  }
  return data as AyarlarRow;
}

export async function deleteRandevu(id: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("randevular").delete().eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function deleteLastik(id: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("lastikler").delete().eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function updateRandevuStatus(id: string, status: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("randevular")
    .update({ durum: status })
    .eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  ).sort();
}
