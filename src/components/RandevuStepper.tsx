"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import DateGridPicker from "@/components/DateGridPicker";
import TimeGridPicker from "@/components/TimeGridPicker";
import Image from "next/image";
import { SENDIKA_LOGOLARI, SENDIKA_SECENEKLERI, sendikaBasHarfleri } from "@/lib/sendikalar";
import { WHATSAPP_LINK } from "@/components/site/contact";
import {
  dakikaToSaat,
  doluSaatler,
  gununSaatleri,
  haftaninGunu,
  hizmetSuresi,
  OGLE_MOLASI_METNI,
  saatToDakika,
  type Aralik,
  type CalismaSaatleri
} from "@/lib/calisma";
import {
  ARAC_TURLERI,
  HIZMETLER,
  DEGISIM_PAKETLERI,
  TAMIR_FIYATI,
  formatTL,
  balansEtiketi,
  lastikEtiketi,
  paketHesapla,
  type AracTuru,
  type HizmetKey
} from "@/lib/lastikPaketleri";

type RandevuStepperProps = {
  action: (
    prevState: { ok: boolean; message?: string },
    formData: FormData
  ) => Promise<{ ok: boolean; message?: string }>;
  getReservedSlots: (date: string) => Promise<Aralik[]>;
  calismaSaatleri: CalismaSaatleri;
  minDate: string;
  maxDate: string;
  initialHizmet?: HizmetKey | null;
};

// Adımlar. "arac" ve "paket" adımları sadece lastik değişiminde gösterilir.
// Fiyat paket kartlarında ve son onay ekranında görünür; ayrıca onay kutusu yok.
type StepId = "hizmet" | "arac" | "paket" | "iletisim" | "tarih" | "ozet";
const STEP_LABELS: Record<StepId, string> = {
  hizmet: "Hizmet",
  arac: "Araç Türü",
  paket: "Lastik Sayısı",
  iletisim: "İletişim",
  tarih: "Tarih/Saat",
  ozet: "Onay"
};

// Her adımın başında müşteriyi yönlendiren kısa açıklama
const STEP_HINTS: Record<StepId, { baslik: string; metin: string }> = {
  hizmet: {
    baslik: "Randevu almak için hizmet seçiniz",
    metin: "Lastik değiştirecekseniz “Lastik Değişimi”, patlak lastik için “Lastik Tamiri”ni seçin."
  },
  arac: {
    baslik: "Araç türünü seçiniz",
    metin: "Otomobil ve SUV için “Binek Araç”, pikap ve minibüs için “Ticari Araç”ı seçin."
  },
  paket: {
    baslik: "Kaç lastik değişecek?",
    metin: "Değişecek lastik sayısını seçin. Fiyat kartın üzerinde yazar."
  },
  iletisim: {
    baslik: "İletişim bilgilerinizi giriniz",
    metin: "Randevunuz bu ad ve telefon numarasıyla kaydedilir. Sendikanızı logosuna dokunarak seçin."
  },
  tarih: {
    baslik: "Size uygun gün ve saati seçiniz",
    metin: "Önce tarihi, sonra boş saatlerden birini seçin. Dolu saatler seçilemez."
  },
  ozet: {
    baslik: "Bilgilerinizi kontrol edip randevunuzu alınız",
    metin: "Her şey doğruysa “Randevu Al” butonuna basın; randevunuz hemen kesinleşir, ayrıca aranmazsınız. Değiştirmek için “Geri” ile dönebilirsiniz."
  }
};

const cardBase =
  "flex h-full flex-col justify-between rounded-2xl border p-4 text-left backdrop-blur-md transition-all shadow-lg sm:p-5";
const cardIdle = "border-brand-gold/20 bg-white/10 hover:bg-white/20 hover:border-brand-gold/40";
const cardActive = "border-brand-gold bg-brand-gold/20 scale-[1.02]";

export default function RandevuStepper({
  action,
  getReservedSlots,
  calismaSaatleri,
  minDate,
  maxDate,
  initialHizmet
}: RandevuStepperProps) {
  const [hizmet, setHizmet] = useState<HizmetKey | null>(initialHizmet ?? null);
  const [aracTuru, setAracTuru] = useState<AracTuru | null>(null);
  const [paketId, setPaketId] = useState<string | null>(null);
  const [iletisim, setIletisim] = useState({ ad: "", telefon: "", sendika: "", not: "" });
  const [tarih, setTarih] = useState({ value: "", label: "" });
  const [saat, setSaat] = useState("");

  const steps: StepId[] = useMemo(
    () =>
      hizmet === "tamir"
        ? ["hizmet", "iletisim", "tarih", "ozet"]
        : ["hizmet", "arac", "paket", "iletisim", "tarih", "ozet"],
    [hizmet]
  );
  const [stepIndex, setStepIndex] = useState(initialHizmet ? 1 : 0);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const paket = useMemo(
    () => paketHesapla(hizmet, aracTuru, paketId),
    [hizmet, aracTuru, paketId]
  );

  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [mevcutRandevular, setMevcutRandevular] = useState<Aralik[]>([]);
  const [formState, formAction, pending] = useActionState(action, { ok: false });
  const [localError, setLocalError] = useState<string | null>(null);
  const submitIntentRef = useRef(false);
  const topRef = useRef<HTMLDivElement | null>(null);
  const firstRenderRef = useRef(true);

  // Adım değişince formun başına kaydır: telefonda yeni adım ekranın dışında kalmasın
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const el = topRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80; // üst menü payı
    if (Math.abs(window.scrollY - top) > 40) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [stepIndex]);

  useEffect(() => {
    if (!tarih.value) return;
    setMevcutRandevular([]);
    getReservedSlots(tarih.value)
      .then(setMevcutRandevular)
      .catch(() => setMevcutRandevular([]));
  }, [tarih.value, getReservedSlots]);

  // Seçilen hizmetin dükkânda kapladığı süre: tek lastik / tamir 30 dk, 4 lastik 60 dk
  const sure = hizmetSuresi({ hizmetKey: hizmet, lastik_adedi: paket?.lastikAdedi });

  // Süre değişirse (ör. geri dönüp 4 lastiğe geçilirse) seçili saat artık uymayabilir
  useEffect(() => {
    setSaat("");
  }, [sure]);

  // O gün bu hizmetin başlayabileceği saatler; bugünse geçmiş saatler çıkarılır
  const bugunSaatleri = (tarihStr: string) => {
    const slots = gununSaatleri(calismaSaatleri, tarihStr, sure);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    if (tarihStr !== todayStr) return slots;
    const simdi = now.getHours() * 60 + now.getMinutes();
    return slots.filter((slot) => saatToDakika(slot) > simdi);
  };
  const filteredTimeSlots = tarih.value ? bugunSaatleri(tarih.value) : [];
  const doluSlotlar = doluSaatler(filteredTimeSlots, sure, mevcutRandevular);
  const gunAraligi = tarih.value ? calismaSaatleri[haftaninGunu(tarih.value)] : null;
  // Kapalı günler ve bugün saati geçmişse bugün seçilemez
  const kapaliMi = (tarihStr: string) => bugunSaatleri(tarihStr).length === 0;

  useEffect(() => {
    if (formState.ok) {
      setLocalError(null);
      return;
    }
    if (formState.message) {
      setLocalError(formState.message);
      // Saat başkası tarafından alındıysa ya da o gün zaten randevusu varsa tarih adımına dön
      if (formState.message.includes("rezerve") || formState.message.includes("zaten bir randevunuz")) {
        setSaat("");
        setStepIndex(steps.indexOf("tarih"));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  // Her adımın "ilerle" koşulu
  function validateStep(): string | null {
    switch (step) {
      case "hizmet":
        return hizmet ? null : "Lütfen bir hizmet seçiniz.";
      case "arac":
        return aracTuru ? null : "Lütfen araç türünü seçiniz.";
      case "paket":
        if (!paket) return "Lütfen kaç lastik değişeceğini seçiniz.";
        return null;
      case "iletisim":
        if (!iletisim.ad.trim()) return "Lütfen ad soyad giriniz.";
        if (iletisim.telefon.replace(/\D/g, "").length < 10)
          return "Lütfen geçerli bir telefon numarası giriniz.";
        if (!iletisim.sendika) return "Lütfen sendikanızı seçiniz.";
        return null;
      case "tarih":
        if (!tarih.value) return "Lütfen tarih seçiniz.";
        if (!saat) return "Lütfen saat seçiniz.";
        return null;
      default:
        return null;
    }
  }

  const goNext = () => {
    submitIntentRef.current = false;
    const err = validateStep();
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    submitIntentRef.current = false;
    setLocalError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const chooseHizmet = (key: HizmetKey) => {
    setHizmet(key);
    if (key === "tamir") {
      setAracTuru(null);
      setPaketId(null);
    }
    setLocalError(null);
    // Tek seçimlik adım: seçince doğrudan sonraki adıma geç
    setStepIndex(1);
  };

  const isLast = stepIndex === steps.length - 1;

  return (
    // Alttaki boşluk: mobilde sabit WhatsApp butonu "Randevu Al" butonunun üstüne binmesin
    <div ref={topRef} className="flex flex-col gap-4 sm:gap-6">
      {/* Telefonda: tek satır ilerleme çubuğu */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-bold text-white">{STEP_LABELS[step]}</span>
          <span className="text-white/60">
            Adım {stepIndex + 1}/{steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gold transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      {/* Tablet ve bilgisayarda: tüm adımlar */}
      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        {steps.map((id, index) => (
          <div key={id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                index === stepIndex ? "bg-brand-gold text-brand-dark" : "bg-white/10 text-white"
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-sm ${index === stepIndex ? "text-white" : "text-white/70"}`}>
              {STEP_LABELS[id]}
            </span>
          </div>
        ))}
      </div>

      {formState.ok && paket ? (
        // Randevu alındı: özet ekranda kalır ki müşteri gün ve saati not edebilsin
        <div className="grid gap-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">Randevunuz alındı!</h2>
            <p className="mt-2 text-sm text-white/70">Randevunuz kesinleşti, ayrıca aranmayacaksınız.</p>
          </div>
          {/* Arayıp teyit etmiyoruz: müşteri zamanında gelsin, gelemeyecekse saati boşaltsın */}
          <ul className="grid gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/[0.08] p-5 text-left text-sm text-white/90">
            <li className="flex gap-3">
              <span aria-hidden="true">⏰</span>
              <span>
                Lütfen randevu saatinizden <strong className="text-brand-gold">5-10 dakika önce</strong> işletmemizde bulununuz.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">❌</span>
              <span>
                Randevunuza gelemeyecekseniz lütfen{" "}
                <a href="/randevu-sorgula" className="font-bold text-brand-gold underline underline-offset-2">
                  randevunuzu iptal ediniz
                </a>
                ; böylece o saati başka bir müşterimiz alabilir.
              </span>
            </li>
          </ul>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-sm text-white/80">
            <Row k="Tarih" v={tarih.label || tarih.value} />
            <Row k="Saat" v={`${saat} - ${dakikaToSaat(saatToDakika(saat) + sure)}`} />
            <Row k="Hizmet" v={paket.hizmetAdi} />
            <Row k="Toplam" v={formatTL(paket.fiyat)} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white"
            >
              WhatsApp&apos;tan bize yazın
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10"
            >
              Yeni randevu al
            </button>
          </div>
        </div>
      ) : (
      <form
        action={formAction}
        onSubmit={(event) => {
          // Sadece son adımda ve butona gerçekten basıldıysa gönder
          if (!isLast || !submitIntentRef.current) {
            event.preventDefault();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.target as HTMLElement).tagName !== "TEXTAREA") {
            event.preventDefault();
          }
        }}
        className="relative grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-6"
      >
        {/* Sunucuya gidecek değerler */}
        <input type="hidden" name="hizmet_key" value={hizmet ?? ""} />
        <input type="hidden" name="arac_turu" value={aracTuru ?? ""} />
        <input type="hidden" name="paket" value={paketId ?? ""} />
        <input type="hidden" name="ad" value={iletisim.ad} />
        <input type="hidden" name="telefon" value={iletisim.telefon} />
        <input type="hidden" name="sendika" value={iletisim.sendika} />
        <input type="hidden" name="not" value={iletisim.not} />
        <input type="hidden" name="tarih" value={tarih.value} />
        <input type="hidden" name="saat" value={saat} />

        {!formState.ok && localError ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {localError}
          </div>
        ) : null}

        <div className="px-1">
          <h2 className="text-lg font-black text-white sm:text-xl">{STEP_HINTS[step].baslik}</h2>
          <p className="mt-1 text-sm text-white/60">{STEP_HINTS[step].metin}</p>
        </div>

        {/* 1) Hizmet */}
        {step === "hizmet" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(HIZMETLER) as HizmetKey[]).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => chooseHizmet(key)}
                className={`${cardBase} min-h-[110px] sm:min-h-[140px] ${hizmet === key ? cardActive : cardIdle}`}
              >
                <div>
                  <p className="text-xl font-black text-white">{HIZMETLER[key].ad}</p>
                  <p className="mt-2 text-sm text-white/70">{HIZMETLER[key].aciklama}</p>
                </div>
                <p className="mt-4 text-sm text-white/60">
                  {key === "tamir" ? formatTL(TAMIR_FIYATI) : "150 ₺'den başlayan fiyatlarla"}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* 2) Araç türü (sadece değişim) */}
        {step === "arac" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(ARAC_TURLERI) as AracTuru[]).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  // Araç değişince paketler de değişir (ticaride 4 lastik 2 balans yok)
                  if (key !== aracTuru) setPaketId(null);
                  setAracTuru(key);
                  setLocalError(null);
                  // Tek seçimlik adım: seçimi kısa bir an gösterip lastik sayısı adımına geç
                  setTimeout(() => setStepIndex(steps.indexOf("paket")), 250);
                }}
                className={`${cardBase} min-h-[110px] sm:min-h-[140px] ${aracTuru === key ? cardActive : cardIdle}`}
              >
                <p className="text-xl font-black text-white">{ARAC_TURLERI[key].ad}</p>
                <p className="mt-2 text-sm text-white/70">{ARAC_TURLERI[key].aciklama}</p>
              </button>
            ))}
          </div>
        )}

        {/* 3) Lastik sayısı (sadece değişim) */}
        {step === "paket" && aracTuru && (
          <div className="grid gap-3">
            <p className="text-xs text-white/50">
              {ARAC_TURLERI[aracTuru].ad} · Balans: lastiğin dengeli dönmesi için yapılan ayardır, direksiyonda titremeyi önler.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEGISIM_PAKETLERI[aracTuru].map((p) => {
                const tamBalans = p.balans === p.lastik;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setPaketId(p.id);
                      setLocalError(null);
                      // Araç ve paket seçildi: seçimi kısa bir an gösterip sonraki adıma geç
                      setTimeout(() => setStepIndex(steps.indexOf("iletisim")), 250);
                    }}
                    className={`${cardBase} gap-3 ${paketId === p.id ? cardActive : cardIdle}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg font-black text-white">{lastikEtiketi(p.lastik)}</p>
                      <p className="whitespace-nowrap text-2xl font-black text-brand-gold">{formatTL(p.fiyat)}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                        tamBalans
                          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40"
                          : "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/40"
                      }`}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {balansEtiketi(p)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4) İletişim */}
        {step === "iletisim" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Ad Soyad
              <input
                value={iletisim.ad}
                onChange={(e) => setIletisim((p) => ({ ...p, ad: e.target.value }))}
                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Telefon
              <input
                type="tel"
                value={iletisim.telefon}
                onChange={(e) => setIletisim((p) => ({ ...p, telefon: e.target.value }))}
                placeholder="05XX XXX XX XX"
                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white placeholder:text-white/30"
              />
            </label>
            <fieldset className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
              <legend className="mb-2">Sendikanızı seçiniz</legend>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {SENDIKA_SECENEKLERI.map((s) => {
                  const logo = SENDIKA_LOGOLARI[s as keyof typeof SENDIKA_LOGOLARI];
                  const secili = iletisim.sendika === s;
                  return (
                    <button
                      type="button"
                      key={s}
                      aria-pressed={secili}
                      onClick={() => {
                        setIletisim((p) => ({ ...p, sendika: s }));
                        setLocalError(null);
                      }}
                      className={`${cardBase} items-center gap-3 p-3 text-center sm:p-4 ${secili ? cardActive : cardIdle}`}
                    >
                      <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-20 sm:w-20">
                        {logo ? (
                          <Image src={logo} alt="" fill sizes="80px" className="object-contain p-1" />
                        ) : (
                          <span className="text-xl font-black text-brand-dark">{sendikaBasHarfleri(s)}</span>
                        )}
                      </span>
                      <span className="text-sm font-bold leading-snug text-white">{s}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
              Ek Not (isteğe bağlı)
              <textarea
                rows={3}
                value={iletisim.not}
                onChange={(e) => setIletisim((p) => ({ ...p, not: e.target.value }))}
                placeholder="Örn: Kışlık lastikler bagajda"
                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white placeholder:text-white/30"
              />
            </label>
          </div>
        )}

        {/* 5) Tarih / saat */}
        {/* Takvim bileşenleri kendi seçimlerini tuttuğu için bu adım hep DOM'da kalır, sadece gizlenir */}
        <div className={`grid gap-4 lg:grid-cols-2 ${step === "tarih" ? "" : "hidden"}`}>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Tarih
              <DateGridPicker
                name="tarih_picker"
                minDate={minDate}
                maxDate={maxDate}
                kapaliMi={kapaliMi}
                open={dateOpen}
                onOpenChange={setDateOpen}
                onChange={(value: string, label: string) => {
                  setLocalError(null);
                  setTarih({ value, label });
                  setSaat("");
                  setDateOpen(false);
                  setTimeOpen(true);
                }}
                required={false}
                disabled={false}
              />
              <span className="text-xs text-white/40">Kapalı günler seçilemez</span>
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Saat
              <TimeGridPicker
                // Tarih ya da süre değişince önceki seçim temizlensin
                key={`${tarih.value}-${sure}`}
                name="saat_picker"
                slots={filteredTimeSlots}
                reservedSlots={doluSlotlar}
                durationMinutes={sure}
                open={tarih.value ? timeOpen : false}
                onOpenChange={setTimeOpen}
                disabled={!tarih.value}
                onChange={(value) => {
                  setLocalError(null);
                  setSaat(value);
                  setTimeOpen(false);
                }}
                required={false}
              />
              <span className="text-xs text-white/40">
                {gunAraligi
                  ? `Bu gün ${dakikaToSaat(gunAraligi.start)} - ${dakikaToSaat(gunAraligi.end)} arası açığız (öğle arası ${OGLE_MOLASI_METNI}) · işlem yaklaşık ${sure} dk`
                  : `İşlem yaklaşık ${sure} dk sürer`}
              </span>
            </label>
        </div>

        {/* 6) Son onay */}
        {step === "ozet" && paket && (
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <Row k="Hizmet" v={paket.hizmetAdi} />
            {paket.aracTuru ? (
              <Row
                k="Paket"
                v={`${ARAC_TURLERI[paket.aracTuru].ad} · ${paket.lastikAdedi} lastik değişimi · ${paket.balansAdedi} balans`}
              />
            ) : null}
            <Row k="Ad Soyad" v={iletisim.ad} />
            <Row k="Telefon" v={iletisim.telefon} />
            <Row k="Sendika" v={iletisim.sendika} />
            <Row k="Tarih" v={tarih.label || tarih.value} />
            <Row k="Saat" v={saat ? `${saat} - ${dakikaToSaat(saatToDakika(saat) + sure)}` : ""} />
            {iletisim.not ? <Row k="Ek Not" v={iletisim.not} /> : null}
            <div className="mt-2 flex items-end justify-between border-t border-white/10 pt-3">
              <span className="text-white/60">Toplam</span>
              <span className="text-lg font-bold text-white">{formatTL(paket.fiyat)}</span>
            </div>
            <p className="text-xs text-white/50">Anlaşmalı sendika üyelerine özel fiyattır. Ödeme işlem sonrası dükkânda yapılır.</p>
            <p className="text-xs text-white/50">
              Randevunuz ayrıca aranmadan kesinleşir. Lütfen randevu saatinden 5-10 dakika önce işletmede olunuz; gelemeyecekseniz iptal ediniz.
            </p>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-3 sm:mt-4 sm:gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || pending}
            className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:px-8"
          >
            Geri
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-full bg-brand-gold px-6 py-4 text-base font-bold tracking-tight text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95 sm:flex-none sm:px-10"
            >
              Devam Et
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              onClick={() => {
                submitIntentRef.current = true;
              }}
              className="flex-1 rounded-full bg-brand-gold px-6 py-4 text-base font-bold tracking-tight text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-60 sm:flex-none sm:px-10"
            >
              {pending ? "Gönderiliyor..." : "Randevu Al"}
            </button>
          )}
        </div>
      </form>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/50">{k}</span>
      <span className="text-right text-white">{v || "-"}</span>
    </div>
  );
}
