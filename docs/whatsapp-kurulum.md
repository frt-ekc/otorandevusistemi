# WhatsApp randevu mesajı kurulumu

Müşteri sitede randevu alınca, kendisine WhatsApp'tan otomatik olarak şu mesaj gider:

> Merhaba Ali, Fırat Oto Lastik randevunuz oluşturuldu.
> Tarih: 20 Ekim Salı · Saat: 10:30 · Hizmet: Lastik Değişimi
> Adres: Cirikpınar Mah. Araposman Cad. Battalgazi / Malatya (Şenpınar Düğün Salonu yanı)
> Yol tarifi: Google Haritalar linki

Bu, Meta'nın (WhatsApp'ın sahibi) resmi sistemiyle çalışır. Kod hazır; aşağıdaki adımları sizin
yapmanız gerekiyor, çünkü hesaplar sizin adınıza açılmalı. Adımlar bitene kadar site eskisi gibi
çalışır, sadece mesaj gitmez.

**Önemli kural:** WhatsApp, işletmenin müşteriye ilk mesajı yalnızca Meta'nın önceden onayladığı
bir "şablon" ile göndermesine izin verir. Bu yüzden 4. adımda mesaj metnini Meta'ya onaylatacağız.

---

## 1. Meta Business hesabı açın

1. https://business.facebook.com adresine gidin, Facebook hesabınızla girin.
2. "Hesap oluştur" deyin. İşletme adı: **Fırat Oto Lastik**, adınız ve iş e-postanız.
3. Ayarlar → **İşletme bilgileri** kısmına adres, telefon ve web sitesini (www.fıratotolastik.com) yazın.
4. Mümkünse **İşletme doğrulaması** yapın (vergi levhası vb. istenir). Doğrulama olmadan da
   başlanabilir ama günlük mesaj sınırı düşük kalır.

## 2. WhatsApp uygulamasını ekleyin

1. https://developers.facebook.com/apps adresine gidin → **Uygulama oluştur**.
2. Tür olarak **İşletme (Business)** seçin, az önce açtığınız işletme hesabına bağlayın.
3. Uygulama sayfasında **WhatsApp** kutusunda **Kur (Set up)** deyin.
4. Meta size ücretsiz bir **test numarası** verir. İlk denemeyi bununla yapabilirsiniz
   (test numarası en fazla 5 kayıtlı numaraya mesaj atabilir — kendi numaranızı ekleyin).

## 3. Gerçek numaranızı ekleyin

1. WhatsApp → **API Kurulumu** sayfasında **Telefon numarası ekle** deyin.
2. Hangi numarayı kullanacağınıza karar verin:
   - **Yeni bir numara** (en kolayı): Henüz WhatsApp'ta kullanılmayan bir hat.
   - **Dükkânın mevcut numarası (0538 706 10 65):** Bu numara şu an telefonda WhatsApp'ta
     kullanılıyorsa, Meta kurulum sırasında size "WhatsApp Business uygulamasıyla birlikte kullan"
     seçeneği sunabilir. Sunmazsa, numarayı API'ye almak telefondaki WhatsApp'tan çıkarmak
     anlamına gelir. Emin değilseniz yeni numara alın.
3. SMS ile gelen kodu girin. Görünen ad olarak **Fırat Oto Lastik** yazın.
4. Ödeme yöntemi ekleyin (WhatsApp Business hesabı → **Ödeme ayarları**). Meta randevu
   mesajları için mesaj başına küçük bir ücret alır; güncel Türkiye fiyatı:
   https://developers.facebook.com/docs/whatsapp/pricing

## 4. Mesaj şablonunu onaya gönderin

1. WhatsApp Manager → **Mesaj şablonları** → **Şablon oluştur**.
2. Kategori: **Yardımcı program (Utility)**.
3. Ad: `randevu_onay` (tam olarak böyle, küçük harf).
4. Dil: **Türkçe**.
5. Değişken türü sorulursa **Sayı (Number)** seçin.
6. Gövde (Body) kısmına aşağıdaki metni **aynen** yapıştırın:

```
Merhaba {{1}}, Fırat Oto Lastik randevunuz oluşturuldu.

Tarih: {{2}}
Saat: {{3}}
Hizmet: {{4}}
Adres: {{5}}
Yol tarifi: {{6}}

Randevunuzu değiştirmek veya iptal etmek için bu mesaja yazabilirsiniz. Görüşmek üzere!
```

7. Meta örnek değer ister. Şunları yazın:
   {{1}} `Ali Yılmaz` · {{2}} `20 Ekim Salı` · {{3}} `10:30` · {{4}} `Lastik Değişimi` ·
   {{5}} `Cirikpınar Mah. Araposman Cad. Battalgazi / Malatya` ·
   {{6}} `https://www.google.com/maps/dir/?api=1&destination=38.357305,38.313855`
8. **Gönder** deyin. Onay genelde birkaç dakika ile 1 gün arası sürer.

> Sıra önemli: {{1}} ad, {{2}} tarih, {{3}} saat, {{4}} hizmet, {{5}} adres, {{6}} yol tarifi.
> Metni değiştirmek isterseniz numaraların yerini değiştirmeyin.

## 5. Kalıcı erişim anahtarı (token) alın

API Kurulumu sayfasındaki geçici anahtar 24 saatte biter; kalıcı anahtar gerekir:

1. https://business.facebook.com → **Ayarlar** → **Kullanıcılar** → **Sistem kullanıcıları** → **Ekle**.
   Ad: `randevu-sitesi`, rol: **Yönetici**.
2. Bu kullanıcıya **Varlık ekle** deyin: uygulamanızı ve WhatsApp hesabınızı seçip tam yetki verin.
3. **Yeni token oluştur** → uygulamanızı seçin → süre: **Hiçbir zaman sona ermez** →
   izinler: `whatsapp_business_messaging` ve `whatsapp_business_management`.
4. Çıkan uzun metni kopyalayın. **Bu bir şifredir: kimseyle paylaşmayın, sohbete yapıştırmayın.**
5. API Kurulumu sayfasından **Telefon numarası kimliği (Phone number ID)** değerini de not edin
   (15 haneli bir sayı; telefon numaranızın kendisi değil).

## 6. Vercel'e ekleyin

1. https://vercel.com → projeniz → **Settings** → **Environment Variables**.
2. Şu ikisini ekleyin (Environment: **Production** işaretli olsun):

| Name | Value |
| --- | --- |
| `WHATSAPP_TOKEN` | 5. adımda kopyaladığınız uzun anahtar |
| `WHATSAPP_PHONE_NUMBER_ID` | 15 haneli telefon numarası kimliği |

   İsteğe bağlı (şablon adını değiştirdiyseniz): `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANG` (varsayılan `randevu_onay` ve `tr`).
3. **Deployments** sekmesinde en üstteki yayının yanındaki **⋯** → **Redeploy** deyin.

## 7. Deneyin

Sitede kendi cep numaranızla bir randevu alın. Birkaç saniye içinde WhatsApp mesajı gelmelidir.
Sonra admin panelinden bu deneme randevusunu iptal edin.

Mesaj gelmezse: Vercel → projeniz → **Logs** kısmında "WhatsApp" diye arayın; hata yazısı orada
görünür. En sık sebepler: şablon henüz onaylanmamış, şablon adı/dili farklı, token süresi dolmuş
ya da test numarası kullanılıyorsa alıcı numara kayıtlı değil.

## Nasıl çalışıyor (teknik not)

- Kod: `src/lib/whatsapp.ts`, randevu kaydı: `src/app/(public)/randevu/actions.ts`.
- Mesaj yalnızca randevu veritabanına başarıyla kaydedildikten sonra, müşteriye "randevunuz
  alındı" yanıtı döndükten sonra (`after`) gönderilir. Gönderim hata verirse randevu etkilenmez.
- Ortam değişkenleri yoksa gönderim sessizce atlanır.
- Sabit hat (0422…) gibi cep numarası olmayan numaralara mesaj gönderilmez.
