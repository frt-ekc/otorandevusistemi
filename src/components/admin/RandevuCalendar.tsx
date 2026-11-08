"use client";

import { useState, useMemo } from "react";
import { formatTL, paketAciklamasi } from "@/lib/lastikPaketleri";
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
    sendika?: string | null;
    arac_turu?: string | null;
    lastik_adedi?: number | null;
    balans_adedi?: number | null;
    fiyat?: number | null;
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
        <div className="flex min-w-0 flex-col gap-6 xl:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
                {/* Filtre Alanı */}
                <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-brand-slate p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">Filtrele:</span>
                        <select
                            value={selectedHizmet}
                            onChange={(e) => setSelectedHizmet(e.target.value)}
                            className="rounded-lg border border-white/10 bg-brand-dark px-3 py-1.5 text-xs text-brand-text outline-none focus:border-brand-gold"
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

                <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-brand-slate p-3 sm:p-4 min-h-[600px]">
                    <style jsx global>{`
            /* Sitedeki tasarım: asfalt zemin, ince çizgiler, tabela sarısı vurgu */
            .rbc-calendar { color: #EEEAE3; font-family: inherit; }
            .rbc-month-view { border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 16px; overflow: hidden; background: #141312; }
            .rbc-header { border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; border-left-color: rgba(255, 255, 255, 0.06) !important; padding: 10px 0; font-weight: 700; font-size: 12px; color: #A39C90; }
            .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255, 255, 255, 0.06) !important; }
            .rbc-day-bg { border-left: 1px solid rgba(255, 255, 255, 0.06) !important; transition: background 0.15s; cursor: pointer; }
            .rbc-day-bg:hover { background: rgba(250, 204, 21, 0.06) !important; }
            .rbc-off-range-bg { background: rgba(255, 255, 255, 0.02) !important; }
            .rbc-off-range { color: rgba(238, 234, 227, 0.3); }
            .rbc-today { background: rgba(250, 204, 21, 0.1) !important; }
            .rbc-day-bg.has-appointments { box-shadow: inset 0 -3px 0 #FACC15; }
            .rbc-date-cell { padding: 6px 8px; font-size: 13px; font-weight: 600; }
            .rbc-event, .rbc-event.rbc-selected { background: #FACC15; color: #141312; border: none; border-radius: 6px; font-size: 0.72rem; font-weight: 700; padding: 1px 6px; }
            .rbc-show-more { color: #FACC15; background: transparent; font-weight: 700; }
            .rbc-toolbar { gap: 8px; flex-wrap: wrap; }
            .rbc-event-content { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .rbc-toolbar button { color: #EEEAE3; border: 1px solid rgba(255, 255, 255, 0.15); background: transparent; font-weight: 600; font-size: 13px; border-radius: 999px !important; padding: 6px 14px; }
            .rbc-toolbar button:hover, .rbc-toolbar button:focus { background: rgba(255, 255, 255, 0.06); color: #EEEAE3; border-color: rgba(255, 255, 255, 0.3); }
            .rbc-toolbar button.rbc-active { background: #FACC15; color: #141312; border-color: #FACC15; box-shadow: none; }
            .rbc-btn-group { display: flex; gap: 6px; }
            .rbc-toolbar .rbc-toolbar-label { font-family: var(--font-display); font-stretch: 112%; font-size: 1.25rem; font-weight: 800; color: #EEEAE3; text-transform: capitalize; }
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
                        }}
                        views={['month']}
                        view={Views.MONTH}
                        date={selectedDate}
                        onNavigate={(newDate) => setSelectedDate(newDate)}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        dayPropGetter={(date) => {
                            const hasAppointments = randevular.some((r) => {
                                const d = parse(r.tarih, "yyyy-MM-dd", new Date());
                                return isSameDay(d, date) && r.durum !== 'iptal';
                            });
                            return {
                                className: hasAppointments ? "has-appointments" : "",
                            };
                        }}
                    />
                </div>
            </div>

            {/* Detay Paneli */}
            <div className="flex w-full min-w-0 flex-col gap-4 xl:w-80 xl:shrink-0">
                <div className="rounded-3xl border border-white/10 bg-brand-slate p-5 sm:p-6 xl:sticky xl:top-6">
                    <h2 className="text-xl font-bold text-brand-text mb-1">
                        {format(selectedDate, "d MMMM yyyy", { locale: tr })}
                    </h2>
                    <p className="text-xs text-brand-gold uppercase tracking-widest mb-6">
                        Günün Randevuları
                    </p>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto break-words pr-2">
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
                                        <p className="font-bold text-brand-text text-base">{r.hizmet}</p>
                                        {paketAciklamasi(r) ? <p className="text-sm text-white/70">{paketAciklamasi(r)}</p> : null}
                                        {r.fiyat ? <p className="text-sm font-black text-brand-gold">{formatTL(r.fiyat)}</p> : null}
                                        <p className="text-sm text-white/80">{r.ad}</p>
                                        <div className="flex flex-col text-xs text-brand-muted pt-2 gap-1 border-t border-white/5 mt-2">
                                            <p>📞 {r.telefon}</p>
                                            {r.sendika && <p>🏷️ Sendika: {r.sendika}</p>}
                                            {r.plaka && <p>🚗 Plaka: {r.plaka}</p>}
                                        </div>
                                        {r.not_metni && (
                                            <p className="text-xs text-brand-muted italic mt-2 bg-white/5 p-2 rounded">
                                                <span className="whitespace-pre-line">{r.not_metni}</span>
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
                                <p className="text-brand-muted italic text-sm">
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
