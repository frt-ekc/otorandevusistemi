"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import DateGridPicker from "@/components/DateGridPicker";
import TimeGridPicker from "@/components/TimeGridPicker";
import type { HizmetRow } from "@/lib/db";

type ServiceItem = { title: string; duration: string };

type RandevuStepperProps = {
  action: (
    prevState: { ok: boolean; message?: string },
    formData: FormData
  ) => Promise<{ ok: boolean; message?: string }>;
  getReservedSlots: (date: string) => Promise<string[]>;
  services: ServiceItem[];
  steps: string[];
  timeSlots: string[];
  minDate: string;
  maxDate: string;
};

export default function RandevuStepper({
  action,
  getReservedSlots,
  services,
  steps,
  timeSlots,
  minDate,
  maxDate
}: RandevuStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const submitIntentRef = useRef(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [summary, setSummary] = useState({
    ad: "",
    telefon: "",
    email: "",
    plaka: "",
    hizmet: "",
    tarih: "",
    saat: "",
    not: ""
  });

  useEffect(() => {
    if (summary.tarih) {
      setReservedSlots([]); // Önceki tarihin verisini temizle
      getReservedSlots(summary.tarih)
        .then(setReservedSlots)
        .catch(() => setReservedSlots([]));
    }
  }, [summary.tarih, getReservedSlots]);
  const stepActive = (index: number) => currentStep === index;
  const [formState, formAction] = useActionState(action, { ok: false });
  const [localError, setLocalError] = useState<string | null>(null);
  const [rejectedDate, setRejectedDate] = useState<string | null>(null);

  const filteredTimeSlots = useMemo(() => {
    if (!summary.tarih) return timeSlots;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (summary.tarih !== todayStr) {
      return timeSlots;
    }

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    return timeSlots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      if (h > currentHour) return true;
      if (h === currentHour && m > currentMinute) return true;
      return false;
    });
  }, [summary.tarih, timeSlots]);

  useEffect(() => {
    if (formState.ok) {
      setLocalError(null);
      // Başarılı olduğunda 3 saniye sonra sıfırla ve başa dön
      const timer = setTimeout(() => {
        // Sayfa yenilemek yerine router veya state reset de olabilir ama 
        // formState'i temizlemek için reload en kesin çözüm.
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    } else if (formState.message) {
      setLocalError(formState.message);
      // Eğer hata "randevu bulunmaktadır" hatasıysa, bu plaka+tarih kombinasyonunu kara listeye al
      if (formState.message.includes("randevu bulunmaktadır")) {
        setRejectedDate(`${summary.plaka}-${summary.tarih}`);
      }
    }
  }, [formState.ok, formState.message]); // summary.tarih'i çıkardık, sadece hata geldiğinde çalışsın

  const goNext = () => {
    submitIntentRef.current = false; // Her adım geçişinde güvenliği sıfırla
    setLocalError(null); // Adım geçerken eski hatayı temizle

    // Tarih adımında (2. adım), reddedilen plaka+tarih kontrolü
    if (currentStep === 2 && `${summary.plaka}-${summary.tarih}` === rejectedDate) {
      setLocalError("Lütfen farklı bir tarih seçiniz, bu plakaya bu tarihte aktif randevunuz bulunmaktadır.");
      return;
    }

    const container = stepRefs.current[currentStep];
    if (!container) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }
    const requiredFields = Array.from(
      container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input[required], select[required], textarea[required]"
      )
    );
    const requiredRadios = Array.from(
      container.querySelectorAll<HTMLInputElement>("input[type='radio'][required]")
    );
    const radioGroups = Array.from(new Set(requiredRadios.map((radio) => radio.name)));
    for (const name of radioGroups) {
      const anyChecked = requiredRadios.some(
        (radio) => radio.name === name && radio.checked
      );
      if (!anyChecked) {
        requiredRadios.find((radio) => radio.name === name)?.reportValidity();
        return;
      }
    }
    for (const field of requiredFields) {
      if (!field.value) {
        field.reportValidity();
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    submitIntentRef.current = false; // Geri dönerken de sıfırla
    setLocalError(null); // Hatayı temizle ki kullanıcı kafa karışıklığı yaşamasın
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${index === currentStep
                ? "bg-brand-gold text-brand-dark"
                : "bg-white/10 text-white"
                }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-sm ${index === currentStep ? "text-white" : "text-white/70"
                }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        action={formAction}
        onSubmit={(event) => {
          if (event.nativeEvent instanceof KeyboardEvent && (event.nativeEvent as KeyboardEvent).key === "Enter") {
            event.preventDefault();
            return;
          }
          // Sadece son adımda ve kullanıcı gerçekten butona bastıysa gönderime izin ver
          if (currentStep !== steps.length - 1 || !submitIntentRef.current) {
            event.preventDefault();
            return;
          }
        }}
        className="relative grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-2"
      >
        {formState.ok && (
          // ... success overlay ...
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center rounded-2xl bg-brand-dark/95 text-center backdrop-blur-xl animate-in fade-in zoom-in duration-500">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white px-4">Randevunuz Başarıyla Alındı!</h2>
            <p className="mt-4 max-w-[320px] px-6 text-lg text-emerald-100/80">
              Müşteri temsilcimiz en kısa sürede sizi arayacaktır.
            </p>
            <div className="mt-10 flex items-center gap-3 text-white/40">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="text-sm font-bold uppercase tracking-widest">
                Giriş sayfasına dönülüyor...
              </p>
            </div>
          </div>
        )}

        {!formState.ok && localError ? (
          <div className="lg:col-span-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 animate-in slide-in-from-top-2 mb-2">
            {localError}
          </div>
        ) : null}
        <div
          ref={(el) => { stepRefs.current[0] = el; }}
          className={`grid gap-4 lg:col-span-2 ${currentStep === 0 ? "" : "hidden"}`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <label
                key={service.title}
                className="group relative cursor-pointer"
              >
                <input
                  type="radio"
                  name="hizmet"
                  value={service.title}
                  required={stepActive(0)}
                  disabled={!stepActive(0)}
                  className="peer sr-only"
                  onChange={(event) =>
                    setSummary((prev) => ({ ...prev, hizmet: event.target.value }))
                  }
                />
                <div className="flex h-full min-h-[140px] flex-col justify-between rounded-2xl border border-brand-gold/20 bg-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/20 hover:border-brand-gold/40 hover:-translate-y-1 peer-checked:border-brand-gold peer-checked:bg-brand-gold/20 peer-checked:scale-[1.02] shadow-lg">
                  <div>
                    <p className="text-xl font-black text-white group-hover:text-brand-gold transition-colors">
                      {service.title}
                    </p>
                    {service.duration ? (
                      <p className="mt-2 text-xs font-bold text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                        {service.duration}
                      </p>
                    ) : null}
                  </div>
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-gold opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div
          ref={(el) => { stepRefs.current[1] = el; }}
          className={`grid gap-4 lg:grid-cols-2 lg:col-span-2 ${currentStep === 1 ? "" : "hidden"
            }`}
        >
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Ad Soyad
            <input
              name="ad"
              required={stepActive(1)}
              disabled={!stepActive(1)}
              onChange={(event) =>
                setSummary((prev) => ({ ...prev, ad: event.target.value }))
              }
              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Telefon
            <input
              name="telefon"
              required={stepActive(1)}
              disabled={!stepActive(1)}
              onChange={(event) =>
                setSummary((prev) => ({ ...prev, telefon: event.target.value }))
              }
              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Email (opsiyonel)
            <input
              name="email"
              type="email"
              disabled={!stepActive(1)}
              onChange={(event) =>
                setSummary((prev) => ({ ...prev, email: event.target.value }))
              }
              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Araç Plakası
            <input
              name="plaka"
              required={stepActive(1)}
              disabled={!stepActive(1)}
              onChange={(event) =>
                setSummary((prev) => ({ ...prev, plaka: event.target.value }))
              }
              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            />
          </label>
        </div>

        <div
          ref={(el) => { stepRefs.current[2] = el; }}
          className={`grid gap-4 lg:grid-cols-2 lg:col-span-2 ${currentStep === 2 ? "" : "hidden"
            }`}
        >
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Tarih
            <DateGridPicker
              name="tarih_picker"
              minDate={minDate}
              maxDate={maxDate}
              open={dateOpen}
              onOpenChange={setDateOpen}
              onChange={(value: string, label: string) => {
                setLocalError(null); // Yeni tarih seçildiğinde hatayı temizle
                setSummary((prev) => ({
                  ...prev,
                  tarih: value,
                  tarihLabel: label,
                  saat: "" // Tarih değişince saati temizle
                }));
                setDateOpen(false);
                setTimeEnabled(true);
                setTimeOpen(true);
              }}
              required={stepActive(2)}
              disabled={!stepActive(2)}
            />
            <span className="text-xs text-white/40">
              Çalışma saatleri 08:00 - 22:00 · 30 dk aralıklar
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Saat
            <TimeGridPicker
              name="saat_picker"
              slots={filteredTimeSlots}
              reservedSlots={reservedSlots}
              open={timeEnabled ? timeOpen : false}
              onOpenChange={setTimeOpen}
              disabled={!timeEnabled || !stepActive(2)}
              onChange={(value) => {
                setSummary((prev) => ({ ...prev, saat: value }));
                setTimeOpen(false);
              }}
              required={stepActive(2)}
            />
            <span className="text-xs text-white/40">
              Son randevu 21:30 başlar.
            </span>
          </label>
        </div>

        <div
          ref={(el) => { stepRefs.current[3] = el; }}
          className={`grid gap-4 lg:col-span-2 ${currentStep === 3 ? "" : "hidden"}`}
        >
          {/* 
            Disabled/hidden inputs are not submitted by the browser.
            We mirror the step data into hidden inputs so server action receives all values.
          */}
          <input type="hidden" name="hizmet" value={summary.hizmet} />
          <input type="hidden" name="ad" value={summary.ad} />
          <input type="hidden" name="telefon" value={summary.telefon} />
          <input type="hidden" name="email" value={summary.email} />
          <input type="hidden" name="plaka" value={summary.plaka} />
          <input type="hidden" name="tarih" value={summary.tarih} />
          <input type="hidden" name="saat" value={summary.saat} />
          <input type="hidden" name="not" value={summary.not} />

          <label className="flex flex-col gap-2 text-sm text-white/70">
            Not (opsiyonel)
            <textarea
              name="not"
              rows={3}
              disabled={!stepActive(3)}
              onChange={(event) =>
                setSummary((prev) => ({ ...prev, not: event.target.value }))
              }
              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                Özet
              </p>
              <p className="text-lg font-semibold text-white">
                Bilgileri kontrol edip gönderin
              </p>
            </div>
          </div>



          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div>
              <span className="text-white/50">Hizmet:</span>{" "}
              <span className="text-white">{summary.hizmet || "-"}</span>
            </div>
            <div>
              <span className="text-white/50">Ad Soyad:</span>{" "}
              <span className="text-white">{summary.ad || "-"}</span>
            </div>
            <div>
              <span className="text-white/50">Telefon:</span>{" "}
              <span className="text-white">{summary.telefon || "-"}</span>
            </div>
            <div>
              <span className="text-white/50">Email:</span>{" "}
              <span className="text-white">{summary.email || "-"}</span>
            </div>
            <div>
              <span className="text-white/50">Plaka:</span>{" "}
              <span className="text-white">{summary.plaka || "-"}</span>
            </div>
            <div>
              <span className="text-white/50">Tarih:</span>{" "}
              <span className="text-white">{(summary as any).tarihLabel || "-"}</span>
            </div>
            <div>
              <span className="text-white/50">Saat:</span>{" "}
              <span className="text-white">{summary.saat || "-"}</span>
            </div>
            {summary.not ? (
              <div>
                <span className="text-white/50">Not:</span>{" "}
                <span className="text-white">{summary.not}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-2 mt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0}
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Geri
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-brand-gold px-10 py-4 text-base font-bold text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95 tracking-tight"
            >
              Devam Et
            </button>
          ) : (
            <button
              type="submit"
              onClick={() => { submitIntentRef.current = true; }}
              className="rounded-full bg-brand-gold px-10 py-4 text-base font-bold text-brand-dark shadow-[0_4px_25px_rgba(251,191,36,0.3)] transition-all hover:scale-105 active:scale-95 tracking-tight"
            >
              Randevu Oluştur
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
