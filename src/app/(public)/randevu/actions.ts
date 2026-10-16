"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { SENDIKA_SECENEKLERI, normalizePhone } from "@/lib/sendikalar";

export async function createAppointment(
    _prevState: { ok: boolean; message?: string },
    formData: FormData
) {
    const islem = String(formData.get("islem") ?? "").trim();
    const ekNot = String(formData.get("not") ?? "").trim();
    // Yapılacak işlem ayrı bir kolon yerine randevu notunun başına yazılır,
    // admin panelinde not olarak görünür.
    const notMetni = [islem ? `İşlem: ${islem}` : "", ekNot ? `Not: ${ekNot}` : ""]
        .filter(Boolean)
        .join("\n");

    const payload = {
        ad: String(formData.get("ad") ?? "").trim(),
        telefon: String(formData.get("telefon") ?? "").trim(),
        sendika: String(formData.get("sendika") ?? "").trim(),
        hizmet: String(formData.get("hizmet") ?? "").trim(),
        tarih: String(formData.get("tarih") ?? "").trim(),
        saat: String(formData.get("saat") ?? "").trim(),
        not_metni: notMetni,
        durum: "bekliyor"
    };

    if (!payload.ad || !payload.telefon) {
        return { ok: false, message: "Ad soyad ve telefon alanları zorunludur." };
    }
    if (normalizePhone(payload.telefon).length < 10) {
        return { ok: false, message: "Lütfen geçerli bir telefon numarası giriniz." };
    }
    if (!SENDIKA_SECENEKLERI.includes(payload.sendika)) {
        return { ok: false, message: "Lütfen sendika seçiniz." };
    }
    if (!islem) {
        return { ok: false, message: "Lütfen yapılacak işlemi yazınız." };
    }
    if (!payload.tarih || !payload.saat) {
        return { ok: false, message: "Lütfen tarih ve saat seçiniz." };
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
    return (data || []).map(r => {
        let s = String(r.saat || "").trim().replace(".", ":");
        // Eğer format H:mm ise başına 0 ekle (örn: 8:00 -> 08:00)
        if (s.length === 4 && s.includes(":")) s = "0" + s;
        // İlk 5 karakteri al (HH:mm)
        return s.substring(0, 5);
    });
}
