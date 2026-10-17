import { normalizePhone } from "@/lib/sendikalar";
import { ADRES_TARIF, ADRES_VARSAYILAN, YOL_TARIFI_LINK } from "@/components/site/contact";

// Randevu sonrası müşteriye Meta WhatsApp Cloud API ile onay mesajı.
// WhatsApp, işletmenin ilk mesajı için Meta'nın onayladığı bir şablon ister.
// Şablon metni ve kurulum: docs/whatsapp-kurulum.md
// Ortam değişkenleri yoksa hiçbir şey göndermez (yerelde ve kurulum bitmeden sessizce atlanır).

const GRAPH_API = "https://graph.facebook.com/v21.0";

export type RandevuMesaji = {
    ad: string;
    telefon: string;
    tarih: string; // YYYY-MM-DD
    saat: string; // HH:MM
    hizmet: string;
    adres?: string | null;
};

// Türk cep numarasını WhatsApp'ın istediği 905XXXXXXXXX biçimine çevirir; olmuyorsa null.
export function whatsappNumarasi(telefon: string) {
    let d = normalizePhone(telefon);
    if (d.startsWith("0090")) d = d.slice(2);
    if (d.length === 11 && d.startsWith("0")) d = "9" + d;
    if (d.length === 10 && d.startsWith("5")) d = "90" + d;
    return /^905\d{9}$/.test(d) ? d : null;
}

function trTarih(isoDate: string) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: "UTC",
        day: "numeric",
        month: "long",
        weekday: "long"
    }).format(new Date(Date.UTC(y, m - 1, d)));
}

// Şablon parametrelerinde satır sonu, sekme ve 4'ten fazla art arda boşluk olamaz.
function temizle(metin: string) {
    return metin.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim() || "-";
}

export async function randevuMesajiGonder(r: RandevuMesaji) {
    const token = process.env.WHATSAPP_TOKEN;
    const numaraId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !numaraId) return;

    const alici = whatsappNumarasi(r.telefon);
    if (!alici) {
        console.warn("WhatsApp: telefon numarası cep numarası değil, mesaj gönderilmedi.");
        return;
    }

    const adres = `${r.adres?.trim() || ADRES_VARSAYILAN} (${ADRES_TARIF})`;
    // Şablondaki {{1}}..{{6}} sırası docs/whatsapp-kurulum.md ile aynı olmalı.
    const parametreler = [r.ad, trTarih(r.tarih), r.saat, r.hizmet, adres, YOL_TARIFI_LINK].map((p) => ({
        type: "text",
        text: temizle(p)
    }));

    const res = await fetch(`${GRAPH_API}/${numaraId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: alici,
            type: "template",
            template: {
                name: process.env.WHATSAPP_TEMPLATE_NAME || "randevu_onay",
                language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "tr" },
                components: [{ type: "body", parameters: parametreler }]
            }
        }),
        signal: AbortSignal.timeout(10_000)
    });
    if (!res.ok) {
        console.error("WhatsApp mesajı gönderilemedi:", res.status, await res.text().catch(() => ""));
    }
}
