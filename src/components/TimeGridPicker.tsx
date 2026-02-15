"use client";

import { useMemo, useState } from "react";

type TimeGridPickerProps = {
  name: string;
  slots: string[];
  reservedSlots?: string[];
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
  reservedSlots = [],
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
      const isReserved = reservedSlots.includes(slot);
      return { slot, endLabel, isReserved };
    });
  }, [slots, durationMinutes, reservedSlots]);

  return (
    <details
      className="group rounded-2xl border border-white/10 bg-brand-night/50 px-4 py-3 shadow-xl"
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
        className={`flex items-center justify-between text-sm ${disabled ? "text-white/50" : "text-white/80"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
          }
        }}
      >
        <span>{selectedLabel || placeholder}</span>
        <span className="text-xs text-brand-gold font-bold">{open ? "×" : "+"}</span>
      </summary>
      <div className="mt-6">
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Müsait
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Dolu
          </span>
        </div>
        <div className="mt-4 grid gap-3 grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {slotItems.map((item) => (
            <label
              key={item.slot}
              className={`group relative ${item.isReserved ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="radio"
                name={name}
                value={item.slot}
                required={required}
                className="peer sr-only"
                onChange={() => {
                  if (item.isReserved) return;
                  setSelected(item.slot);
                  onChange?.(item.slot);
                }}
                disabled={disabled || item.isReserved}
              />
              <div className={`relative overflow-hidden rounded-xl border-2 px-3 py-3 text-center transition-all ${item.isReserved
                  ? "border-rose-500/20 bg-rose-500/5 opacity-40"
                  : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/20 shadow-lg shadow-emerald-500/5"
                }`}>
                {item.isReserved && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center opacity-40">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" className="text-rose-500" />
                      <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" className="text-rose-500" />
                    </svg>
                  </div>
                )}
                <p className={`text-sm font-black ${item.isReserved ? "text-rose-200" : "text-emerald-50"} `}>{item.slot}</p>
                <p className={`mt-0.5 text-[10px] font-bold ${item.isReserved ? "text-rose-300/40" : "text-emerald-300/40"} `}>{item.endLabel}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </details>
  );
}
