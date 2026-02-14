"use client";

import { useState } from "react";
import Image from "next/image";
import { LastikRow } from "@/lib/db";

interface LastikResultGridProps {
    results: LastikRow[];
}

export default function LastikResultGrid({ results }: LastikResultGridProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((lastik) => (
                    <div
                        key={lastik.id}
                        className="group relative rounded-2xl border border-brand-gold/20 bg-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/15"
                    >
                        <div className="flex gap-4">
                            {lastik.image_url && (
                                <div
                                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 cursor-zoom-in"
                                    onClick={() => setSelectedImage(lastik.image_url)}
                                >
                                    <Image
                                        src={lastik.image_url}
                                        alt={`${lastik.marka} ${lastik.genislik}/${lastik.yanak} R${lastik.jant}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-2xl font-black text-white group-hover:text-brand-gold transition-colors">
                                            {lastik.genislik}/{lastik.yanak} R{lastik.jant}
                                        </p>
                                        <p className="mt-2 text-sm font-bold text-white uppercase tracking-tighter drop-shadow-sm">
                                            Marka: <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{lastik.marka ?? "-"}</span>
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${lastik.durum === 'sıfır' ? 'bg-green-500/20 text-green-400' : 'bg-brand-gold/20 text-brand-gold'
                                        }`}>
                                        {lastik.durum}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {lastik.ozellik ? (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-white font-bold uppercase tracking-wider drop-shadow-sm">Özellikler:</p>
                                <p className="mt-1 text-base text-white italic font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                    {lastik.ozellik}
                                </p>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-brand-gold transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative h-[80vh] w-[80vw]">
                            <Image
                                src={selectedImage}
                                alt="Büyük Görünüm"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
