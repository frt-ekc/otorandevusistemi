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

    const components = {
        dateCellWrapper: ({ children, value }: any) => {
            return (
                <div className="rbc-day-bg-custom-wrapper relative group h-full w-full">
                    {children}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-brand-gold/10 transition-all duration-300 pointer-events-none border border-brand-gold/20 z-0" />
                </div>
            );
        },
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

                <div className="admin-calendar-outer rounded-[3rem] border border-white/5 bg-[#0b1120]/60 p-10 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] min-h-[800px] relative overflow-hidden">
                    <style jsx global>{`
            /* TAKVİMİN ANA MODERNİZE EDİLMİŞ HALİ */
            .rbc-calendar { 
                color: #f1f5f9 !important; 
                font-family: inherit !important;
                height: 800px !important;
            }
            
            .rbc-month-view { 
                border: 1px solid rgba(255, 255, 255, 0.05) !important; 
                border-radius: 32px !important; 
                overflow: hidden !important; 
                background: rgba(0, 0, 0, 0.2) !important;
                backdrop-filter: blur(20px);
            }

            /* HÜCRE ANİMASYONLARI (GÜÇLÜ VE BELİRGİN) */
            .rbc-day-bg-custom-wrapper {
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                cursor: pointer !important;
                position: relative !important;
                z-index: 1 !important;
                height: 100%;
                width: 100%;
            }
            
            .rbc-day-bg-custom-wrapper:hover {
                background: rgba(250, 204, 21, 0.15) !important;
                transform: scale(1.05) !important;
                z-index: 50 !important;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(250, 204, 21, 0.15) !important;
                border-radius: 16px !important;
            }

            .rbc-day-bg {
                background: transparent !important;
                border-right: 1px solid rgba(255, 255, 255, 0.03) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
            }

            /* BUGÜNÜN ÖZEL GÖRÜNÜMÜ */
            .rbc-today { 
                background: rgba(250, 204, 21, 0.1) !important; 
            }
            
            .rbc-today .rbc-button-link {
                color: #facc15 !important;
                font-weight: 900 !important;
                text-shadow: 0 0 15px rgba(250, 204, 21, 0.7);
                background: rgba(250, 204, 21, 0.2);
                padding: 4px 10px;
                border-radius: 10px;
                margin: 4px;
            }

            /* RANDEVU KARTLARI (PREMIUM) */
            .rbc-event { 
              background: rgba(255, 255, 255, 0.05) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-left: 4px solid #facc15 !important;
              color: white !important;
              border-radius: 12px !important; 
              font-size: 0.75rem !important; 
              font-weight: 800 !important;
              padding: 6px 12px !important;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
              margin: 4px 8px !important;
              backdrop-filter: blur(10px);
            }
            
            .rbc-event:hover { 
                transform: scale(1.1) translateX(5px) !important; 
                background: rgba(250, 204, 21, 0.25) !important; 
                border-color: #facc15 !important;
                box-shadow: -15px 0 40px rgba(250, 204, 21, 0.25);
                z-index: 100 !important;
            }

            /* ÜST HEADER VE TOOLBAR */
            .rbc-header { 
              border: none !important;
              padding: 24px 0 !important; 
              font-weight: 900 !important; 
              text-transform: uppercase;
              letter-spacing: 0.2em;
              color: rgba(255, 255, 255, 0.4) !important; 
              font-size: 0.7rem;
            }

            .rbc-toolbar { 
                margin-bottom: 50px !important;
                padding: 15px !important;
                background: rgba(255, 255, 255, 0.03) !important;
                border-radius: 24px !important;
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
            }

            .rbc-toolbar-label {
                font-size: 1.8rem !important;
                font-weight: 900 !important;
                color: white !important;
                letter-spacing: -0.02em;
            }

            .rbc-toolbar button { 
              color: rgba(255, 255, 255, 0.6) !important; 
              border: 1px solid rgba(255, 255, 255, 0.1) !important; 
              background: transparent !important; 
              border-radius: 16px !important;
              padding: 12px 30px !important;
              font-weight: 800 !important;
              text-transform: uppercase;
              transition: all 0.4s ease !important;
            }
            
            .rbc-toolbar button:hover { 
                background: rgba(255, 255, 255, 0.08) !important; 
                color: white !important;
                transform: translateY(-3px);
                border-color: rgba(255, 255, 255, 0.3);
            }

            .rbc-toolbar button.rbc-active { 
                background: #facc15 !important; 
                color: #0f172a !important; 
                border-color: #facc15 !important;
                box-shadow: 0 15px 35px rgba(250, 204, 21, 0.4);
            }

            .rbc-date-cell { 
                padding: 18px !important; 
                font-weight: 900; 
                font-size: 1.1rem; 
                color: rgba(255, 255, 255, 0.2) !important;
                transition: color 0.3s;
            }
            .rbc-month-row:hover .rbc-date-cell { color: rgba(255, 255, 255, 0.3) !important; }
          `}</style>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 800 }}
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
                        dayPropGetter={(date) => ({
                            className: "calendar-day-custom",
                        })}
                        components={components}
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
