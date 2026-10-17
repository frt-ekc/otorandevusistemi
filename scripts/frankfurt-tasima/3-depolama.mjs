// 3) Depolama kovalarını (tire, products, services...) ve içindeki tüm görselleri
//    eski projeden yeni projeye kopyalar. Tekrar çalıştırılabilir: var olan dosyaların
//    üzerine yazar, eksikleri ekler. Eski projede hiçbir şey değişmez.
//
// Çalıştırma (proje kök klasöründen):
//   node --env-file=scripts/frankfurt-tasima/.env.tasima scripts/frankfurt-tasima/3-depolama.mjs
import { createClient } from "@supabase/supabase-js";

const gerekli = ["ESKI_SUPABASE_URL", "ESKI_SERVICE_ROLE_KEY", "YENI_SUPABASE_URL", "YENI_SERVICE_ROLE_KEY"];
for (const ad of gerekli) {
  if (!process.env[ad]) {
    console.error(`HATA: .env.tasima içinde ${ad} doldurulmamış.`);
    process.exit(1);
  }
}
if (process.env.ESKI_SUPABASE_URL === process.env.YENI_SUPABASE_URL) {
  console.error("HATA: ESKI_SUPABASE_URL ile YENI_SUPABASE_URL aynı.");
  process.exit(1);
}

const secenek = { auth: { persistSession: false } };
const eski = createClient(process.env.ESKI_SUPABASE_URL, process.env.ESKI_SERVICE_ROLE_KEY, secenek);
const yeni = createClient(process.env.YENI_SUPABASE_URL, process.env.YENI_SERVICE_ROLE_KEY, secenek);

// Bir kovadaki tüm dosyaların yolunu (alt klasörler dahil) döndürür
async function dosyalariListele(kova, klasor = "") {
  const sonuc = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await eski.storage.from(kova).list(klasor, { limit: 1000, offset });
    if (error) throw new Error(`${kova}/${klasor} listelenemedi: ${error.message}`);
    for (const oge of data) {
      const yol = klasor ? `${klasor}/${oge.name}` : oge.name;
      if (oge.id === null) {
        sonuc.push(...(await dosyalariListele(kova, yol)));
      } else if (oge.name !== ".emptyFolderPlaceholder") {
        sonuc.push({ yol, tur: oge.metadata?.mimetype });
      }
    }
    if (data.length < 1000) break;
  }
  return sonuc;
}

const { data: kovalar, error: kovaHatasi } = await eski.storage.listBuckets();
if (kovaHatasi) throw new Error(`Kovalar okunamadı: ${kovaHatasi.message}`);

let hataSayisi = 0;
for (const kova of kovalar) {
  const ayar = {
    public: kova.public,
    fileSizeLimit: kova.file_size_limit ?? undefined,
    allowedMimeTypes: kova.allowed_mime_types ?? undefined
  };
  const { error: olusturmaHatasi } = await yeni.storage.createBucket(kova.id, ayar);
  if (olusturmaHatasi) {
    // Zaten varsa ayarlarını eşitle
    const { error } = await yeni.storage.updateBucket(kova.id, ayar);
    if (error) throw new Error(`${kova.id} kovası oluşturulamadı: ${olusturmaHatasi.message}`);
  }

  const dosyalar = await dosyalariListele(kova.id);
  console.log(`→ ${kova.id} (${kova.public ? "herkese açık" : "gizli"}): ${dosyalar.length} dosya`);

  let kopyalanan = 0;
  for (const { yol, tur } of dosyalar) {
    const { data: icerik, error: indirmeHatasi } = await eski.storage.from(kova.id).download(yol);
    if (indirmeHatasi) {
      console.error(`  indirilemedi: ${yol}: ${indirmeHatasi.message}`);
      hataSayisi++;
      continue;
    }
    const { error: yuklemeHatasi } = await yeni.storage
      .from(kova.id)
      .upload(yol, icerik, { upsert: true, contentType: tur || icerik.type || undefined });
    if (yuklemeHatasi) {
      console.error(`  yüklenemedi: ${yol}: ${yuklemeHatasi.message}`);
      hataSayisi++;
      continue;
    }
    kopyalanan++;
  }
  console.log(`  ${kopyalanan}/${dosyalar.length} kopyalandı`);
}

if (hataSayisi > 0) {
  console.error(`${hataSayisi} dosya kopyalanamadı. Betiği tekrar çalıştırabilirsiniz.`);
  process.exit(1);
}
console.log("Tamam. Şimdi: scripts/frankfurt-tasima/4-kontrol.sh");
