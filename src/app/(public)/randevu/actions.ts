"use server";

import { getSupabaseServerClient } from "@/lib/supabase";

export async function createAppointment(
    _prevState: { ok: boolean; message?: string },
    formData: FormData
) {
    const payload = {
        ad: String(formData.get("ad") ?? "").trim(),
        telefon: String(formData.get("telefon") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        plaka: String(formData.get("plaka") ?? "").trim().toUpperCase(),
        hizmet: String(formData.get("hizmet") ?? "").trim(),
        tarih: String(formData.get("tarih") ?? "").trim(),
        saat: String(formData.get("saat") ?? "").trim(),
        not_metni: String(formData.get("not") ?? "").trim(),
        durum: "bekliyor"
    };

    if (!payload.plaka || !payload.telefon) {
        return { ok: false, message: "Plaka ve telefon alanları zorunludur." };
    }

    const supabase = getSupabaseServerClient();

    // Mevcut aktif randevu kontrolü (Aynı gün, aynı saat kontrolü - Hizmet farketmeksizin)
    const { data: existing, error: checkError } = await supabase
        .from("randevular")
        .select("id")
        .eq("tarih", payload.tarih)
        .eq("saat", payload.saat)
        .neq("durum", "iptal")
        .limit(1);

    if (checkError) {
        return { ok: false, message: "Doğrulama hatası oluştu." };
    }

    if (existing && existing.length > 0) {
        return {
            ok: false,
            message: "Bu randevu saati az önce başka bir müşteri tarafından rezerve edildi. Lütfen başka bir saat seçiniz."
        };
    }

    const { error } = await supabase.from("randevular").insert([payload]);
    if (error) {
        return { ok: false, message: error.message };
    }
    return { ok: true };
}

export async function getReservedSlots(date: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from("randevular")
        .select("saat")
        .eq("tarih", date)
        .neq("durum", "iptal");

    if (error) return [];
    return (data || []).map(r => r.saat);
}
