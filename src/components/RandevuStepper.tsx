"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import DateGridPicker from "@/components/DateGridPicker";
import TimeGridPicker from "@/components/TimeGridPicker";
import { SENDIKA_SECENEKLERI } from "@/lib/sendikalar";
import {
  ARAC_TURLERI,
  HIZMETLER,
  LASTIK_ADETLERI,
  TAMIR_FIYATI,
  formatTL,
  paketHesapla,
  type AracTuru,
  type HizmetKey
} from "@/lib/lastikPaketleri";

type RandevuStepperProps = {
  action: (
    prevState: { ok: boolean; message?: string },
    formData: FormData
  ) => Promise<{ ok: boolean; message?: string }>;
  getReservedSlots: (date: string) => Promise<string[]>;
  timeSlots: string[];
  minDate: string;
  maxDate: string;
  initialHizmet?: HizmetKey | null;
};

// Adımlar. "paket" adımı sadece lastik değişiminde gösterilir.
type StepId = "hizmet" | "paket" | "fiyat" | "iletisim" | "tarih" | "ozet";
const STEP_LABELS: Record<StepId, string> = {
  hizmet: "Hizmet",
  paket: "Araç ve Lastik",
  fiyat: "Fiyat",
  iletisim: "İletişim",
  tarih: "Tarih/Saat",
  ozet: "Onay"
};

const cardBase =
  "flex h-full flex-col justify-between rounded-2xl border p-5 text-left backdrop-blur-md transition-all shadow-lg";
const cardIdle = "border-brand-gold/20 bg-white/10 hover:bg-white/20 hover:border-brand-gold/40";
const cardActive = "border-brand-gold bg-brand-gold/20 scale-[1.02]";

export default function RandevuStepper({
  action,
  getReservedSlots,
  timeSlots,
  minDate,
  maxDate,
  initialHizmet
}: RandevuStepperProps) {
  const [hizmet, setHizmet] = useState<HizmetKey | null>(initialHizmet ?? null);
  const [aracTuru, setAracTuru] = useState<AracTuru | null>(null);
  const [lastikAdedi, setLastikAdedi] = useState<number | null>(null);
  const [fiyatOnay, setFiyatOnay] = useState(false);
  const [iletisim, setIletisim] = useState({ ad: "", telefon: "", sendika: "", not: "" });
  const [tarih, setTarih] = useState({ value: "", label: "" });
  const [saat, setSaat] = useState("");

  const steps: StepId[] = useMemo(
    () =>
      hizmet === "tamir"
        ? ["hizmet", "fiyat", "iletisim", "tarih", "ozet"]
        : ["hizmet", "paket", "fiyat", "iletisim", "tarih", "ozet"],
    [hizmet]
  );
  const [stepIndex, setStepIndex] = useState(initialHizmet ? 1 : 0);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const paket = useMemo(
    () => paketHesapla(hizmet, aracTuru, lastikAdedi),
    [hizmet, aracTuru, lastikAdedi]
  );

  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [formState, formAction, pending] = useActionState(action, { ok: false });
  const [localError, setLocalError] = useState<string | null>(null);
  const submitIntentRef = useRef(false);

  useEffect(() => {
    if (!tarih.value) return;
    setReservedSlots([]);
    getReservedSlots(tarih.value)
      .then(setReservedSlots)
      .catch(() => setReservedSlots([]));
  }, [tarih.value, getReservedSlots]);

  // Bugün seçildiyse geçmiş saatleri gizle
  const filteredTimeSlots = useMemo(() => {
    if (!tarih.value) return timeSlots;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    if (tarih.value !== todayStr) return timeSlots;
    return timeSlots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
    });
  }, [tarih.value, timeSlots]);

  useEffect(() => {
    if (formState.ok) {
      setLocalError(null);
      const timer = setTimeout(() => window.location.reload(), 3000);
      return () => clearTimeout(timer);
    }
    if (formState.message) {
      setLocalError(formState.message);
      // Saat başkası tarafından alındıysa tarih adımına dön
      if (formState.message.includes("rezerve")) {
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
      case "paket":
        if (!aracTuru) return "Lütfen araç türünü seçiniz.";
        if (!lastikAdedi) return "Lütfen kaç lastik değişeceğini seçiniz.";
        return null;
      case "fiyat":
        return fiyatOnay ? null : "Devam etmek için fiyatı onaylayınız.";
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
    setFiyatOnay(false);
    if (key === "tamir") {
      setAracTuru(null);
      setLastikAdedi(null);
    }
    setLocalError(null);
  };

  const balansBilgisi = (arac: AracTuru, adet: number) => {
    const p = paketHesapla("degisim", arac, adet);
    return p ? `${p.balansAdedi} balans dahil · ${formatTL(p.fiyat)}` : "";
  };

  const isLast = stepIndex === steps.length - 1;

  return (
    // Alttaki boşluk: mobilde sabit WhatsApp butonu "Randevu Al" butonunun üstüne binmesin
    <div className="flex flex-col gap-6 pb-28 sm:pb-0">
      <div className="flex flex-wrap items-center gap-3">
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
        className="relative grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        {/* Sunucuya gidecek değerler */}
        <input type="hidden" name="hizmet_key" value={hizmet ?? ""} />
        <input type="hidden" name="arac_turu" value={aracTuru ?? ""} />
        <input type="hidden" name="lastik_adedi" value={lastikAdedi ?? ""} />
        <input type="hidden" name="ad" value={iletisim.ad} />
        <input type="hidden" name="telefon" value={iletisim.telefon} />
        <input type="hidden" name="sendika" value={iletisim.sendika} />
        <input type="hidden" name="not" value={iletisim.not} />
        <input type="hidden" name="tarih" value={tarih.value} />
        <input type="hidden" name="saat" value={saat} />

        {formState.ok && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center rounded-2xl bg-brand-dark/95 text-center backdrop-blur-xl">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="px-4 text-3xl font-black text-white">Randevunuz Başarıyla Alındı!</h2>
            <p className="mt-4 max-w-[320px] px-6 text-lg text-emerald-100/80">
              Müşteri temsilcimiz en kısa sürede sizi arayacaktır.
            </p>
          </div>
        )}

        {!formState.ok && localError ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {localError}
          </div>
        ) : null}

        {/* 1) Hizmet */}
        {step === "hizmet" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(HIZMETLER) as HizmetKey[]).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => chooseHizmet(key)}
                className={`${cardBase} min-h-[140px] ${hizmet === key ? cardActive : cardIdle}`}
              >
                <div>
                  <p className="text-xl font-black text-white">{HIZMETLER[key].ad}</p>
                  <p className="mt-2 text-sm text-white/70">{HIZMETLER[key].aciklama}</p>
                </div>
                <p className="mt-4 text-sm font-bold text-brand-gold">
                  {key === "tamir" ? formatTL(TAMIR_FIYATI) : "150 ₺'den başlayan fiyatlarla"}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* 2) Araç türü + lastik sayısı (sadece değişim) */}
        {step === "paket" && (
          <div className="grid gap-6">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-white/60">Araç türü</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.keys(ARAC_TURLERI) as AracTuru[]).map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setAracTuru(key);
                      setFiyatOnay(false);
                      setLocalError(null);
                    }}
                    className={`${cardBase} ${aracTuru === key ? cardActive : cardIdle}`}
                  >
                    <p className="text-lg font-black text-white">{ARAC_TURLERI[key].ad}</p>
                    <p className="mt-1 text-sm text-white/70">{ARAC_TURLERI[key].aciklama}</p>
                  </button>
                ))}
              </div>
            </div>

            {aracTuru && (
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-white/60">
                  Kaç lastik değişecek?
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {LASTIK_ADETLERI.map((adet) => (
                    <button
                      type="button"
                      key={adet}
                      onClick={() => {
                        setLastikAdedi(adet);
                        setFiyatOnay(false);
                        setLocalError(null);
                      }}
                      className={`${cardBase} ${lastikAdedi === adet ? cardActive : cardIdle}`}
                    >
                      <p className="text-lg font-black text-white">{adet === 1 ? "Tek lastik" : "4 lastik"}</p>
                      <p className="mt-1 text-sm text-white/70">{balansBilgisi(aracTuru, adet)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3) Fiyat özeti ve onay */}
        {step === "fiyat" && paket && (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Seçiminiz</p>
              <p className="mt-2 text-2xl font-black text-white">{paket.hizmetAdi}</p>
              {paket.aracTuru ? (
                <ul className="mt-3 space-y-1 text-white/80">
                  <li>Araç: {ARAC_TURLERI[paket.aracTuru].ad}</li>
                  <li>Lastik: {paket.lastikAdedi} adet</li>
                  <li>Balans: {paket.balansAdedi} adet (dahil)</li>
                </ul>
              ) : (
                <p className="mt-3 text-white/80">Patlak lastik tamiri</p>
              )}
              <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-white/70">Toplam</span>
                <span className="text-4xl font-black text-brand-gold">{formatTL(paket.fiyat)}</span>
              </div>
              <p className="mt-2 text-xs text-white/50">Anlaşmalı sendika üyelerine özel fiyattır. Ödeme dükkânda yapılır.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white">
              <input
                type="checkbox"
                checked={fiyatOnay}
                onChange={(e) => {
                  setFiyatOnay(e.target.checked);
                  setLocalError(null);
                }}
                className="h-5 w-5 accent-[#fbbf24]"
              />
              Fiyatı onaylıyorum
            </label>
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
            <label className="flex flex-col gap-2 text-sm text-white/70 lg:col-span-2">
              Sendika
              <select
                value={iletisim.sendika}
                onChange={(e) => setIletisim((p) => ({ ...p, sendika: e.target.value }))}
                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
              >
                <option value="" disabled>
                  Sendikanızı seçiniz
                </option>
                {SENDIKA_SECENEKLERI.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
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
              <span className="text-xs text-white/40">Çalışma saatleri 08:00 - 22:00 · 30 dk aralıklar</span>
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Saat
              <TimeGridPicker
                name="saat_picker"
                slots={filteredTimeSlots}
                reservedSlots={reservedSlots}
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
              <span className="text-xs text-white/40">Son randevu 21:30 başlar.</span>
            </label>
        </div>

        {/* 6) Son onay */}
        {step === "ozet" && paket && (
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <Row k="Hizmet" v={paket.hizmetAdi} />
            {paket.aracTuru ? (
              <Row
                k="Paket"
                v={`${ARAC_TURLERI[paket.aracTuru].ad} · ${paket.lastikAdedi} lastik · ${paket.balansAdedi} balans`}
              />
            ) : null}
            <Row k="Ad Soyad" v={iletisim.ad} />
            <Row k="Telefon" v={iletisim.telefon} />
            <Row k="Sendika" v={iletisim.sendika} />
            <Row k="Tarih" v={tarih.label || tarih.value} />
            <Row k="Saat" v={saat} />
            {iletisim.not ? <Row k="Ek Not" v={iletisim.not} /> : null}
            <div className="mt-2 flex items-end justify-between border-t border-white/10 pt-3">
              <span className="text-white/60">Toplam</span>
              <span className="text-2xl font-black text-brand-gold">{formatTL(paket.fiyat)}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || pending}
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Geri
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-brand-gold px-10 py-4 text-base font-bold tracking-tight text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              {step === "paket" ? "İlerle" : "Devam Et"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              onClick={() => {
                submitIntentRef.current = true;
              }}
              className="rounded-full bg-brand-gold px-10 py-4 text-base font-bold tracking-tight text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {pending ? "Gönderiliyor..." : "Randevu Al"}
            </button>
          )}
        </div>
      </form>
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
