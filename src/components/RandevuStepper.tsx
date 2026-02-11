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
   services: ServiceItem[];
   steps: string[];
   timeSlots: string[];
   minDate: string;
   maxDate: string;
 };
 
 export default function RandevuStepper({
   action,
   services,
   steps,
   timeSlots,
   minDate,
   maxDate
 }: RandevuStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
   const formRef = useRef<HTMLFormElement | null>(null);
   const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [submitIntent, setSubmitIntent] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeEnabled, setTimeEnabled] = useState(false);
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
  const stepActive = (index: number) => currentStep === index;
  const [formState, formAction] = useActionState(action, { ok: false });

  useEffect(() => {
    if (formState.ok) {
      setCurrentStep(steps.length - 1);
      setSubmitIntent(false);
    }
  }, [formState.ok, steps.length]);
 
   const goNext = () => {
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
     setCurrentStep((prev) => Math.max(prev - 1, 0));
   };
 
   return (
     <div className="flex flex-col gap-6">
       <div className="flex flex-wrap items-center gap-4">
         {steps.map((step, index) => (
           <div key={step} className="flex items-center gap-3">
             <div
               className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                 index === currentStep
                   ? "bg-brand-gold text-brand-dark"
                   : "bg-white/10 text-white"
               }`}
             >
               {index + 1}
             </div>
             <span
               className={`text-sm ${
                 index === currentStep ? "text-white" : "text-white/70"
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
          if (!submitIntent) {
            event.preventDefault();
          }
        }}
         className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-2"
       >
         <div
           ref={(el) => (stepRefs.current[0] = el)}
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
                 <div className="rounded-2xl border border-brand-gold/60 bg-white/0 p-6 transition hover:-translate-y-0.5 hover:bg-white/5 peer-checked:border-brand-gold peer-checked:bg-brand-gold/10">
                   <p className="text-lg font-semibold text-white">{service.title}</p>
                   {service.duration ? (
                     <p className="mt-2 text-sm text-white/60">{service.duration}</p>
                   ) : null}
                 </div>
               </label>
             ))}
           </div>
         </div>
 
         <div
           ref={(el) => (stepRefs.current[1] = el)}
           className={`grid gap-4 lg:grid-cols-2 lg:col-span-2 ${
             currentStep === 1 ? "" : "hidden"
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
           ref={(el) => (stepRefs.current[2] = el)}
           className={`grid gap-4 lg:grid-cols-2 lg:col-span-2 ${
             currentStep === 2 ? "" : "hidden"
           }`}
         >
           <label className="flex flex-col gap-2 text-sm text-white/70">
             Tarih
            <DateGridPicker
              name="tarih"
              minDate={minDate}
              maxDate={maxDate}
              open={dateOpen}
              onOpenChange={setDateOpen}
              onChange={(_, label) => {
                setSummary((prev) => ({ ...prev, tarih: label }));
                setDateOpen(false);
                setTimeEnabled(true);
                setTimeOpen(true);
              }}
              required={stepActive(2)}
            />
             <span className="text-xs text-white/40">
               Çalışma saatleri 08:00 - 22:00 · 30 dk aralıklar
             </span>
           </label>
           <label className="flex flex-col gap-2 text-sm text-white/70">
             Saat
            <TimeGridPicker
              name="saat"
              slots={timeSlots}
              open={timeEnabled ? timeOpen : false}
              onOpenChange={setTimeOpen}
              disabled={!timeEnabled}
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
           ref={(el) => (stepRefs.current[3] = el)}
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
          {formState.ok ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Randevunuz oluşturuldu. Ekibimiz sizinle iletişime geçecektir.
            </div>
          ) : null}
          {!formState.ok && formState.message ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {formState.message}
            </div>
          ) : null}
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
              <span className="text-white">{summary.tarih || "-"}</span>
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
 
         <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-2">
           <button
             type="button"
             onClick={goBack}
             disabled={currentStep === 0}
             className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
           >
             Geri
           </button>
           {currentStep < steps.length - 1 ? (
             <button
               type="button"
               onClick={goNext}
               className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-dark"
             >
               Devam Et
             </button>
           ) : (
             <button
               type="submit"
              onClick={() => setSubmitIntent(true)}
               className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-dark"
             >
               Randevu Oluştur
             </button>
           )}
         </div>
       </form>
     </div>
   );
 }
