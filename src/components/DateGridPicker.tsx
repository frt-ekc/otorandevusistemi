"use client";

import { useMemo, useState } from "react";

type DateGridPickerProps = {
  name: string;
  minDate: string;
  maxDate: string;
  placeholder?: string;
  onChange?: (value: string, label: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
  disabled?: boolean;
};

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const monthNames = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const dayNames = [
  "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"
];

export default function DateGridPicker({
  name,
  minDate,
  maxDate,
  placeholder = "Tarih seç",
  onChange,
  open,
  onOpenChange,
  required = false,
  disabled = false
}: DateGridPickerProps) {
  const min = useMemo(() => parseIsoDate(minDate), [minDate]);
  const max = useMemo(() => parseIsoDate(maxDate), [maxDate]);
  const [viewMonth, setViewMonth] = useState(
    new Date(min.getFullYear(), min.getMonth(), 1)
  );
  const [selected, setSelected] = useState<string>("");

  const monthStart = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1),
    [viewMonth]
  );

  const monthEnd = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0),
    [viewMonth]
  );

  const days = useMemo(() => {
    const result: Array<{
      value: string;
      dayLabel: string;
      dateLabel: string;
      disabled: boolean;
    }> = [];
    const current = new Date(monthStart);
    while (current <= monthEnd) {
      if (current >= min) {
        const value = toIsoDate(current);
        result.push({
          value,
          dayLabel: dayNames[current.getDay()],
          dateLabel: `${String(current.getDate()).padStart(2, "0")} ${monthNames[current.getMonth()]
            }`,
          disabled: current > max
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [monthStart, monthEnd, min, max]);

  const selectedLabel = useMemo(() => {
    const match = days.find((item) => item.value === selected);
    if (!match) return "";
    return `${match.dayLabel} · ${match.dateLabel}`;
  }, [days, selected]);

  const canPrev =
    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1) >=
    new Date(min.getFullYear(), min.getMonth(), 1);
  const canNext =
    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <=
    new Date(max.getFullYear(), max.getMonth(), 1);

  return (
    <details
      className={`group rounded-2xl border border-white/10 bg-brand-night/50 px-4 py-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      open={disabled ? false : open}
      onToggle={(event) => {
        if (disabled) return;
        const target = event.currentTarget as HTMLDetailsElement;
        onOpenChange?.(target.open);
      }}
    >
      <summary className={`flex items-center justify-between text-sm ${disabled ? "text-white/40 cursor-not-allowed" : "text-white/80 cursor-pointer"}`}>
        <span>{selectedLabel || placeholder}</span>
        <span className="text-xs text-white/50">+</span>
      </summary>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-white/80">
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            disabled={!canPrev || disabled}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Önceki
          </button>
          <span className="text-sm font-semibold text-white">
            {monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            disabled={!canNext || disabled}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sonraki →
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {days.map((slot) => {
            const isSelected = selected === slot.value;
            return (
              <label key={slot.value} className={`group relative ${slot.disabled || disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  type="radio"
                  name={name}
                  value={slot.value}
                  required={required}
                  className="peer sr-only"
                  onChange={() => {
                    if (disabled || slot.disabled) return;
                    setSelected(slot.value);
                    onChange?.(slot.value, `${slot.dayLabel} · ${slot.dateLabel}`);
                  }}
                  disabled={slot.disabled || disabled}
                />
                <div
                  className={`rounded-xl border px-3 py-2 text-left transition ${slot.disabled || disabled
                    ? "border-brand-gold/20 bg-white/5 text-white/35 opacity-50"
                    : "hover:-translate-y-0.5 hover:bg-white/10"
                    } ${isSelected && !slot.disabled && !disabled
                      ? "border-brand-gold bg-brand-gold/15 text-white"
                      : "border-brand-gold/40 bg-white/5 text-white/80"
                    }`}
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                    {slot.dayLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {slot.dateLabel}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </details>
  );
}
