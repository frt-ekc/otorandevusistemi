"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { SENDIKA_SECENEKLERI, normalizePhone } from "@/lib/sendikalar";
import { paketHesapla } from "@/lib/lastikPaketleri";
import { getAyarlar } from "@/lib/db";
import { randevuMesajiGonder } from "@/lib/whatsapp";
import { after } from "next/server";
import {
    ILERI_GUN,
    calismaSaatleri,
    doluSaatler,
    gununSaatleri,
    hizmetSuresi,
    istanbulSimdi,
    saatToDakika,
    tarihEkle,
    type Aralik
} from "@/lib/calisma";

export async function createAppointment(
    _prevState: { ok: boolean; message?: string },
    formData: FormData
) {
    // Fiyat tarayıcıdan alınmaz; seçimden sunucuda yeniden hesaplanır.
    const paket = paketHesapla(
        String(formData.get("hizmet_key") ?? ""),
        String(formData.get("arac_turu") ?? ""),
        String(formData.get("lastik_adedi") ?? "")
    );
    if (!paket) {
        return { ok: false, message: "Lütfen hizmet, araç türü ve lastik sayısını seçiniz." };
    }

    const payload = {
        ad: String(formData.get("ad") ?? "").trim(),
        telefon: String(formData.get("telefon") ?? "").trim(),
        sendika: String(formData.get("sendika") ?? "").trim(),
        hizmet: paket.hizmetAdi,
        arac_turu: paket.aracTuru,
        lastik_adedi: paket.lastikAdedi,
        balans_adedi: paket.balansAdedi,
        fiyat: paket.fiyat,
        tarih: String(formData.get("tarih") ?? "").trim(),
        saat: String(formData.get("saat") ?? "").trim(),
        not_metni: String(formData.get("not") ?? "").trim() || null,
        durum: "bekliyor"
    };

    if (!payload.ad || !payload.telefon) {
        return { ok: false, message: "Ad soyad ve telefon alanları zorunludur." };
    }
    if (normalizePhone(payload.telefon).length < 10) {
        return { ok: false, message: "Lütfen geçerli bir telefon numarası giriniz." };
    }
    if (!SENDIKA_SECENEKLERI.includes(payload.sendika)) {
        return { ok: false, message: "Lütfen sendikanızı seçiniz." };
    }
    if (!payload.tarih || !payload.saat) {
        return { ok: false, message: "Lütfen tarih ve saat seçiniz." };
    }

    // Tarih ve saat: çalışma saatleri içinde, geçmişte değil, 30 gün içinde ve başka randevuyla çakışmıyor
    const sure = hizmetSuresi({ hizmetKey: paket.hizmetKey, lastik_adedi: paket.lastikAdedi });
    const simdi = istanbulSimdi();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.tarih) || payload.tarih < simdi.tarih || payload.tarih > tarihEkle(simdi.tarih, ILERI_GUN)) {
        return { ok: false, message: "Lütfen geçerli bir tarih seçiniz." };
    }
    const ayarlar = await getAyarlar().catch(() => null);
    const saatler = calismaSaatleri(ayarlar);
    const gecerliSaatler = gununSaatleri(saatler, payload.tarih, sure).filter(
        (s) => payload.tarih !== simdi.tarih || saatToDakika(s) > simdi.dakika
    );
    if (!gecerliSaatler.includes(payload.saat)) {
        return { ok: false, message: "Seçtiğiniz saat çalışma saatlerimizin dışında. Lütfen başka bir saat seçiniz." };
    }

    const supabase = getSupabaseServerClient();
    let mevcut: Aralik[];
    try {
        mevcut = await doluAraliklar(payload.tarih);
    } catch {
        return { ok: false, message: "Doğrulama hatası oluştu." };
    }
    if (doluSaatler([payload.saat], sure, mevcut).length > 0) {
        return {
            ok: false,
            message: "Bu randevu saati az önce başka bir müşteri tarafından rezerve edildi. Lütfen başka bir saat seçiniz."
        };
    }

    const { error } = await supabase.from("randevular").insert([payload]);
    if (error) {
        return { ok: false, message: error.message };
    }

    // WhatsApp onayı yanıttan sonra gönderilir; gecikse ya da hata verse de randevu etkilenmez.
    after(() =>
        randevuMesajiGonder({ ...payload, adres: ayarlar?.adres }).catch((e) =>
            console.error("WhatsApp mesajı gönderilemedi:", e)
        )
    );
    return { ok: true };
}

// O günkü aktif randevuların dükkânda kapladığı zaman aralıkları (dakika)
async function doluAraliklar(date: string): Promise<Aralik[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from("randevular")
        .select("saat, hizmet, lastik_adedi")
        .eq("tarih", date)
        .neq("durum", "iptal");
    if (error) throw error;
    return (data || [])
        .map((r) => {
            const start = saatToDakika(r.saat);
            return { start, end: start + hizmetSuresi(r) };
        })
        .filter((r) => !Number.isNaN(r.start));
}

// Formdaki "Dolu" saatler için. Hata olursa boş döner; asıl kontrol kayıt sırasında yapılır.
export async function getReservedSlots(date: string): Promise<Aralik[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
    try {
        return await doluAraliklar(date);
    } catch {
        return [];
    }
}
