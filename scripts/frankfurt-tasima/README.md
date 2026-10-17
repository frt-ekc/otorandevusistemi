# Veritabanını Sidney'den Frankfurt'a taşıma

Supabase bir projenin bölgesini sonradan değiştiremiyor. Bu yüzden Frankfurt'ta yeni
bir proje açılıyor, her şey oraya kopyalanıyor ve site yeni projeye bağlanıyor.
Eski proje hiç değiştirilmiyor; bir sorun çıkarsa geri dönmek 2 dakika sürer.

Beklenen sonuç: Türkiye'den sayfa açılışı ~0,5 sn yerine ~0,1 sn.

Gerekenler: `psql`/`pg_dump` (Homebrew `libpq`, kurulu) ve Node (kurulu).
Bütün komutlar proje kök klasöründen (`otorandevusistemi`) çalıştırılır.

---

## A. Gündüz hazırlık (site çalışmaya devam eder, kesinti yok)

### 1. Frankfurt'ta yeni Supabase projesi
supabase.com/dashboard > **New project**
- Name: `otorandevu-frankfurt` (istediğiniz bir isim)
- Database password: **Generate a password**, şifre yöneticinize kaydedin
- Region: **Central EU (Frankfurt)** (`eu-central-1`)
- Proje hazır olana kadar 1–2 dakika bekleyin.

### 2. Ayar dosyası
```bash
cp scripts/frankfurt-tasima/ortam.ornek scripts/frankfurt-tasima/.env.tasima
```
`.env.tasima` dosyasını editörde açıp iki projenin bilgilerini girin
(bu dosya git'e gitmez; şifreleri sohbete/başka yere yapıştırmayın):

| Değer | Nereden |
|---|---|
| `ESKI_DB_URL`, `YENI_DB_URL` | Projenin üst menüsünde **Connect** > **Session pooler** bağlantı metni. `[YOUR-PASSWORD]` yerine veritabanı şifresi. Eski projenin şifresini bilmiyorsanız: Project Settings > Database > **Reset database password** (site bu şifreyi kullanmaz, sıfırlamak güvenli). |
| `ESKI_SUPABASE_URL`, `YENI_SUPABASE_URL` | Project Settings > Data API > Project URL |
| `ESKI_SERVICE_ROLE_KEY`, `YENI_SERVICE_ROLE_KEY` | Project Settings > API Keys > **Legacy API Keys** sekmesi > `service_role` |

### 3. Kopyalama (deneme turu)
```bash
scripts/frankfurt-tasima/1-sema.sh
```
```bash
scripts/frankfurt-tasima/2-veri.sh
```
```bash
node --env-file=scripts/frankfurt-tasima/.env.tasima scripts/frankfurt-tasima/3-depolama.mjs
```
```bash
scripts/frankfurt-tasima/4-kontrol.sh
```
Son satırda **"SONUÇ: Eski ve yeni proje eşit. ✔"** yazmalı.

- `1-sema.sh`: tablolar, yeni eklenen kolonlar (sendika, arac_turu, lastik_adedi,
  balans_adedi, fiyat, services.gorunur), RLS kuralları ve görsel kovalarının kuralları. Bir kez çalışır.
- `2-veri.sh`: randevular, services, products, lastikler, ayarlar... tüm satırlar; görsel
  adreslerini (`image_url`) yeni projeye çevirir. İstediğiniz kadar tekrar çalışabilir.
- `3-depolama.mjs`: `tire`, `products`, `services` kovaları ve içindeki tüm görseller.
- `4-kontrol.sh`: sadece karşılaştırır, hiçbir şey değiştirmez.

### 4. Admin kullanıcısı
Eski şifre bilinmediği için yeni bir şifreyle oluşturulur.
Yeni projede: **Authentication > Users > Add user > Create new user**
- E-posta: admin paneline girdiğiniz e-posta
- Password: yeni şifre (şifre yöneticisine kaydedin)
- **Auto Confirm User** işaretli olsun.

Vercel > otorandevusistemi-y2uz > Settings > Environment Variables'da `ADMIN_EMAILS`
varsa, bu e-postanın listede olduğundan emin olun (yoksa giriş "yetkisi yok" der).

---

## B. Gece geçişi (~10 dakika, sadece birkaç dakika kesinti)

1. Son verileri kopyalayın (gün içinde gelen randevular ve görseller):
   ```bash
   scripts/frankfurt-tasima/2-veri.sh
   ```
   ```bash
   node --env-file=scripts/frankfurt-tasima/.env.tasima scripts/frankfurt-tasima/3-depolama.mjs
   ```
   ```bash
   scripts/frankfurt-tasima/4-kontrol.sh
   ```
   "eşit ✔" görmeden devam etmeyin.

2. **Vercel** > otorandevusistemi-y2uz > Settings > Environment Variables. Şu dördünü
   yeni projenin değerleriyle değiştirin (Production; Preview'da da varsa orada da):
   - `SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_URL` → yeni Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` → yeni `service_role` (Legacy API Keys)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → yeni `anon` (Legacy API Keys)

3. GitHub'da **Frankfurt bölge PR'ını** (frt-ekc/otorandevusistemi#15, vercel.json: `syd1` → `fra1`)
   açın: taslak olduğu için önce **Ready for review**, sonra **Merge pull request**.
   Vercel yeni ayarlarla otomatik yayına alır. Deployments sayfasında **Ready** olmasını bekleyin.

4. Kontrol:
   ```bash
   curl -sI https://www.xn--fratotolastik-39b.com/randevu | grep -i x-vercel-id
   ```
   `fra1::fra1::...` görünmeli. Sonra sitede: sayfalar ve görseller açılıyor mu,
   deneme randevusu alınıyor mu (admin'den silin), admin girişi yeni şifreyle çalışıyor mu.

5. Geçiş sırasında eski projeye düşmüş randevu var mı? Eski projenin **SQL Editor**'ünde:
   ```sql
   select * from randevular where created_at > now() - interval '1 hour' order by created_at;
   ```
   Yeni projede olmayan varsa admin panelinden elle girin.

## Geri dönüş (bir sorun çıkarsa)
Vercel'deki 4 değişkeni eski değerlerine döndürün ve bölge PR'ını GitHub'da **Revert**
edin (ya da Vercel'de önceki deployment'ı **Promote to Production** yapın). Eski proje
dokunulmadan duruyor.

## C. Bir hafta sonra
- Her şey yolundaysa eski projeyi Supabase'de **Pause project** ile durdurun
  (birkaç hafta daha sorunsuzsa silebilirsiniz).
- Bilgisayardan silin: `scripts/frankfurt-tasima/.env.tasima` (şifreler) ve
  `scripts/frankfurt-tasima/cikti/` (müşteri telefonları dahil veritabanı dökümü).
