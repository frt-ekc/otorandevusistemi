"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { normalizePhone } from "@/lib/sendikalar";
import { istanbulSimdi, saatToDakika } from "@/lib/calisma";

// Randevu henüz başlamadıysa iptal edilebilir (İstanbul saatine göre)
export async function iptalEdilebilirMi(tarih: string, saat: string) {
    const simdi = istanbulSimdi();
    if (tarih > simdi.tarih) return true;
    return tarih === simdi.tarih && saatToDakika(saat) > simdi.dakika;
}

// Müşterinin kendi randevusunu iptal etmesi. Sorgulamadaki gibi ad + telefon eşleşmeli;
// sadece randevu id'si bilinerek başkasının randevusu iptal edilemez.
export async function randevuIptalEt(id: string, ad: string, telefon: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from("randevular")
        .select("id, ad, telefon, tarih, saat, durum, not_metni")
        .eq("id", id)
        .maybeSingle();
    if (error || !data) {
        return { ok: false, message: "Randevu bulunamadı." };
    }

    const adEsit =
        data.ad.trim().toLocaleLowerCase("tr-TR") === ad.trim().toLocaleLowerCase("tr-TR");
    const telEsit = normalizePhone(data.telefon) === normalizePhone(telefon);
    if (!adEsit || !telEsit) {
        return { ok: false, message: "Randevu bilgileri eşleşmedi." };
    }
    if (data.durum === "iptal") {
        return { ok: true };
    }
    if (!(await iptalEdilebilirMi(data.tarih, data.saat))) {
        return { ok: false, message: "Saati geçmiş bir randevu iptal edilemez." };
    }

    const not = [data.not_metni, "Müşteri siteden iptal etti."].filter(Boolean).join("\n");
    const { error: updateError } = await supabase
        .from("randevular")
        .update({ durum: "iptal", not_metni: not })
        .eq("id", id);
    if (updateError) {
        return { ok: false, message: "İptal sırasında bir hata oluştu. Lütfen bizi arayın." };
    }
    return { ok: true };
}
