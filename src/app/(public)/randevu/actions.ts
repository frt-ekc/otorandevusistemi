"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { SENDIKA_SECENEKLERI, adAnahtari, normalizePhone, telefonAnahtari } from "@/lib/sendikalar";
import { paketHesapla } from "@/lib/lastikPaketleri";
import { getAyarlar, telefonRandevulari } from "@/lib/db";
import { iptalEdilebilirMi } from "@/app/(public)/randevu-sorgula/actions";
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

export type RandevuSonucu = { ok: boolean; message?: string; kod?: "mevcut_randevu" };

export async function createAppointment(
    _prevState: RandevuSonucu,
    formData: FormData
): Promise<RandevuSonucu> {
    // Fiyat tarayıcıdan alınmaz; seçimden sunucuda yeniden hesaplanır.
    const paket = paketHesapla(
        String(formData.get("hizmet_key") ?? ""),
        String(formData.get("arac_turu") ?? ""),
        String(formData.get("paket") ?? "")
    );
    if (!paket) {
        return { ok: false, message: "Lütfen hizmet, araç türü ve paketi seçiniz." };
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
    const saatler = calismaSaatleri(await getAyarlar().catch(() => null));
    const gecerliSaatler = gununSaatleri(saatler, payload.tarih, sure).filter(
        (s) => payload.tarih !== simdi.tarih || saatToDakika(s) > simdi.dakika
    );
    if (!gecerliSaatler.includes(payload.saat)) {
        return { ok: false, message: "Seçtiğiniz saat çalışma saatlerimizin dışında. Lütfen başka bir saat seçiniz." };
    }

    const supabase = getSupabaseServerClient();

    // Bu telefonla gelecekte aktif randevu varsa müşteri uyarıyı görüp seçim yapmış olmalı
    // (eski randevuyu iptal et ya da yakını için iptal etmeden devam et).
    // Tarayıcıdaki uyarı atlansa bile kayıt burada durdurulur.
    if (String(formData.get("mevcut_onay") ?? "") !== "1") {
        let aktifler: MevcutRandevu[];
        try {
            aktifler = await aktifRandevular(payload.ad, payload.telefon);
        } catch {
            return { ok: false, message: "Doğrulama hatası oluştu. Lütfen tekrar deneyiniz." };
        }
        if (aktifler.length > 0) {
            return {
                ok: false,
                kod: "mevcut_randevu",
                message: "Bu telefon numarasıyla zaten bir randevunuz var. Lütfen mevcut randevunuzla ilgili seçiminizi yapınız."
            };
        }
    }

    // Aynı telefonla aynı güne ikinci randevu alınamaz (iptal edilenler sayılmaz)
    let ayniGun: { saat: string } | null;
    try {
        ayniGun = await ayniGunRandevusu(payload.tarih, payload.telefon);
    } catch {
        return { ok: false, message: "Doğrulama hatası oluştu." };
    }
    if (ayniGun) {
        return {
            ok: false,
            message: `Bu tarihte saat ${String(ayniGun.saat).slice(0, 5)} için zaten bir randevunuz var. Aynı güne ikinci randevu alınamaz. Saati değiştirmek isterseniz önce "Randevu Sorgula / İptal" sayfasından mevcut randevunuzu iptal edebilirsiniz.`
        };
    }

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
    return { ok: true };
}

// Bu telefonun o günkü aktif randevusu (telefon farklı biçimde yazılmış olabilir, rakamlar karşılaştırılır)
async function ayniGunRandevusu(date: string, telefon: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from("randevular")
        .select("saat, telefon")
        .eq("tarih", date)
        .neq("durum", "iptal");
    if (error) throw error;
    const hedef = telefonAnahtari(telefon);
    return (data || []).find((r) => telefonAnahtari(r.telefon) === hedef) ?? null;
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

export type MevcutRandevu = {
    id: string | null; // sadece ad da eşleşiyorsa dolu (iptal için gerekir)
    tarih: string;
    saat: string;
    hizmet: string;
    adEslesiyor: boolean;
};

// Bu telefon numarasıyla alınmış, iptal edilmemiş ve saati henüz gelmemiş randevular.
// Telefon her biçimde (boşluklu, başında 0 / +90 olan) eşleşir. Ad da eşleşiyorsa
// (büyük/küçük harf ve Türkçe karakter farkı gözetilmez) müşteri randevuyu buradan iptal edebilir;
// eşleşmiyorsa sadece tarih ve saat söylenir, başkasının adı ve iptal yetkisi verilmez.
async function aktifRandevular(ad: string, telefon: string): Promise<MevcutRandevu[]> {
    const hedefAd = adAnahtari(ad);
    const aktifler: MevcutRandevu[] = [];
    for (const r of await telefonRandevulari(telefon)) {
        if (r.durum === "iptal") continue;
        if (!(await iptalEdilebilirMi(r.tarih, r.saat))) continue;
        const adEslesiyor = adAnahtari(r.ad) === hedefAd;
        aktifler.push({
            id: adEslesiyor ? r.id : null,
            tarih: r.tarih,
            saat: String(r.saat).slice(0, 5),
            hizmet: r.hizmet,
            adEslesiyor
        });
    }
    return aktifler.sort((a, b) => `${a.tarih} ${a.saat}`.localeCompare(`${b.tarih} ${b.saat}`));
}

// Randevu formu, iletişim adımından sonra bunu sorar. Hata olursa boş döner;
// asıl kontrol kayıt sırasında createAppointment içinde yeniden yapılır.
export async function mevcutRandevular(ad: string, telefon: string): Promise<MevcutRandevu[]> {
    if (telefonAnahtari(telefon).length < 10) return [];
    try {
        return await aktifRandevular(ad, telefon);
    } catch {
        return [];
    }
}
