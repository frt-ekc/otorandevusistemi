"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "tr": tr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

type Randevu = {
    id: string;
    ad: string;
    telefon: string;
    email: string | null;
    plaka: string | null;
    hizmet: string;
    tarih: string;
    saat: string;
    not_metni: string | null;
    durum: string;
};

type Hizmet = {
    id: string;
    name: string;
};

type Props = {
    randevular: Randevu[];
    hizmetler: Hizmet[];
    onCancel: (id: string) => Promise<void>;
};

export default function RandevuCalendar({ randevular, hizmetler, onCancel }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [view, setView] = useState<View>(Views.MONTH);
    const [selectedHizmet, setSelectedHizmet] = useState<string>("all");

    const filteredRandevular = useMemo(() => {
        return randevular.filter((r) => {
            const matchesHizmet = selectedHizmet === "all" ? true : r.hizmet === selectedHizmet;
            return matchesHizmet;
        });
    }, [randevular, selectedHizmet]);

    const events = useMemo(() => {
        return filteredRandevular.map((r) => {
            const start = parse(`${r.tarih} ${r.saat}`, "yyyy-MM-dd HH:mm", new Date());
            const end = addMinutes(start, 30);
            return {
                id: r.id,
                title: `${r.saat} - ${r.ad}`,
                start,
                end,
                resource: r,
            };
        });
    }, [filteredRandevular]);

    const selectedDayAppointments = useMemo(() => {
        return filteredRandevular
            .filter((r) => {
                const d = parse(r.tarih, "yyyy-MM-dd", new Date());
                return isSameDay(d, selectedDate);
            })
            .sort((a, b) => a.saat.localeCompare(b.saat));
    }, [filteredRandevular, selectedDate]);

    const handleSelectSlot = (slotInfo: { start: Date }) => {
        setSelectedDate(slotInfo.start);
    };

    const handleSelectEvent = (event: any) => {
        setSelectedDate(event.start);
    };

    const handleCancelClick = async (id: string) => {
        if (confirm("Bu randevuyu iptal etmek istiyor musun?")) {
            await onCancel(id);
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 flex flex-col gap-4">
                {/* Filtre Alanı */}
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">Filtrele:</span>
                        <select
                            value={selectedHizmet}
                            onChange={(e) => setSelectedHizmet(e.target.value)}
                            className="rounded-lg border border-white/10 bg-brand-night px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-brand-gold"
                        >
                            <option value="all">Tüm Hizmetler</option>
                            {hizmetler.map((h) => (
                                <option key={h.id} value={h.name}>
                                    {h.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md min-h-[600px]">
                    <style jsx global>{`
            .rbc-calendar { color: white; font-family: inherit; }
            .rbc-off-range-bg { background: rgba(255, 255, 255, 0.02); }
            .rbc-today { background: rgba(251, 191, 36, 0.1); }
            .rbc-event { 
              background: #ef4444; 
              border-radius: 4px; 
              font-size: 0.75rem; 
              border: none;
            }
            .rbc-event.rbc-selected { background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
            .rbc-header { border-bottom: 2px solid rgba(255, 255, 255, 0.1); padding: 10px 0; font-weight: 700; color: #facc15; }
            .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; }
            .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(255, 255, 255, 0.1); }
            .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255, 255, 255, 0.1); }
            .rbc-toolbar button { color: white; border: 1px solid rgba(255, 255, 255, 0.2); background: transparent; }
            .rbc-toolbar button:hover { background: rgba(255, 255, 255, 0.1); color: white; }
            .rbc-toolbar button.rbc-active { background: #facc15; color: #0f172a; border-color: #facc15; }
          `}</style>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        culture="tr"
                        messages={{
                            next: "Sonraki",
                            previous: "Önceki",
                            today: "Bugün",
                            month: "Ay",
                            week: "Hafta",
                            day: "Gün",
                            agenda: "Ajanda",
                        }}
                        view={view}
                        onView={(newView) => setView(newView)}
                        date={selectedDate}
                        onNavigate={(newDate) => setSelectedDate(newDate)}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                    />
                </div>
            </div>

            {/* Detay Paneli */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sticky top-6">
                    <h2 className="text-xl font-bold text-white mb-1">
                        {format(selectedDate, "d MMMM yyyy", { locale: tr })}
                    </h2>
                    <p className="text-xs text-brand-gold uppercase tracking-widest mb-6">
                        Günün Randevuları
                    </p>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {selectedDayAppointments.length > 0 ? (
                            selectedDayAppointments.map((r) => (
                                <div key={r.id} className={`p-4 rounded-xl border transition-all ${r.durum === 'iptal' ? 'border-red-500/20 bg-red-500/5 opacity-60' : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-brand-gold font-bold text-lg">{r.saat}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${r.durum === 'iptal' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {r.durum === 'iptal' ? 'İptal' : 'Aktif'}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-bold text-white text-base">{r.hizmet}</p>
                                        <p className="text-sm text-white/80">{r.ad}</p>
                                        <div className="flex flex-col text-xs text-white/50 pt-2 gap-1 border-t border-white/5 mt-2">
                                            <p>📞 {r.telefon}</p>
                                            {r.plaka && <p>🚗 Plaka: {r.plaka}</p>}
                                        </div>
                                        {r.not_metni && (
                                            <p className="text-xs text-white/40 italic mt-2 bg-white/5 p-2 rounded">
                                                "{r.not_metni}"
                                            </p>
                                        )}
                                    </div>

                                    {r.durum !== 'iptal' && (
                                        <button
                                            onClick={() => handleCancelClick(r.id)}
                                            className="w-full mt-4 text-[10px] uppercase font-bold py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all tracking-widest"
                                        >
                                            Randevuyu İptal Et
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-white/20 text-4xl mb-4">📅</p>
                                <p className="text-white/40 italic text-sm">
                                    Bu gün için randevu bulunmamaktadır.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
