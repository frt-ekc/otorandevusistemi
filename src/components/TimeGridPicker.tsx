 "use client";

 import { useMemo, useState } from "react";

 type TimeGridPickerProps = {
   name: string;
   slots: string[];
   durationMinutes?: number;
   placeholder?: string;
   onChange?: (value: string) => void;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
   disabled?: boolean;
    required?: boolean;
 };

 export default function TimeGridPicker({
   name,
   slots,
   durationMinutes = 30,
   placeholder = "Saat seç",
   onChange,
   open,
   onOpenChange,
    disabled = false,
    required = false
 }: TimeGridPickerProps) {
   const [selected, setSelected] = useState<string>("");

   const selectedLabel = selected || "";

   const slotItems = useMemo(() => {
     return slots.map((slot) => {
       const [hour, minute] = slot.split(":").map(Number);
       const endTotal = hour * 60 + minute + durationMinutes;
       const endHour = Math.floor(endTotal / 60) % 24;
       const endMinute = endTotal % 60;
       const endLabel = `${String(endHour).padStart(2, "0")}:${String(
         endMinute
       ).padStart(2, "0")}`;
       return { slot, endLabel };
     });
   }, [slots, durationMinutes]);

  return (
    <details
      className="group rounded-2xl border border-white/10 bg-brand-night/50 px-4 py-3"
      open={disabled ? false : open}
      onToggle={(event) => {
        if (disabled) {
          event.preventDefault();
          onOpenChange?.(false);
          return;
        }
        const target = event.currentTarget as HTMLDetailsElement;
        onOpenChange?.(target.open);
      }}
    >
      <summary
        className={`flex items-center justify-between text-sm ${
          disabled ? "text-white/50" : "text-white/80"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
          }
        }}
      >
        <span>{selectedLabel || placeholder}</span>
        <span className="text-xs text-white/50">+</span>
      </summary>
       <div className="mt-4">
         <div className="flex items-center gap-4 text-xs text-white/70">
           <span className="flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-white/80" />
             Müsait
           </span>
           <span className="flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-white/30" />
             Dolu
           </span>
         </div>
         <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
           {slotItems.map((item) => (
             <label
               key={item.slot}
               className="group relative cursor-pointer"
             >
               <input
                 type="radio"
                 name={name}
                 value={item.slot}
                 required={required}
                 className="peer sr-only"
                 onChange={() => {
                   setSelected(item.slot);
                   onChange?.(item.slot);
                 }}
                 disabled={disabled}
               />
               <div className="rounded-2xl border border-brand-gold/40 bg-white/5 px-4 py-3 text-center text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10 peer-checked:border-brand-gold peer-checked:bg-brand-gold/15 peer-checked:text-white">
                 <p className="text-base font-semibold text-white">{item.slot}</p>
                 <p className="mt-1 text-xs text-white/60">{item.endLabel}</p>
               </div>
             </label>
           ))}
         </div>
       </div>
     </details>
   );
 }
