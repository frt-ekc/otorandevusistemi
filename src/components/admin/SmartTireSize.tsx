"use client";

import { useState, useEffect } from "react";

// Türkiye pazarındaki binek, hafif ticari, SUV ve 4x4 araçlar için yaygın ebatlar
const tireMatrix: Record<string, Record<string, string[]>> = {
    "155": {
        "65": ["13", "14"],
        "70": ["13"],
        "80": ["13"]
    },
    "165": {
        "60": ["14"],
        "65": ["13", "14"],
        "70": ["13", "14"]
    },
    "175": {
        "65": ["14", "15"],
        "70": ["13", "14"],
        "75": ["13"]
    },
    "185": {
        "55": ["15", "16"],
        "60": ["14", "15"],
        "65": ["14", "15"],
        "70": ["14"],
        "75": ["14", "16"]
    },
    "195": {
        "45": ["16", "17"],
        "50": ["15", "16"],
        "55": ["15", "16"],
        "60": ["15", "16"],
        "65": ["15", "16"],
        "70": ["14", "15", "15C"],
        "75": ["16C"]
    },
    "205": {
        "40": ["17", "18"],
        "45": ["16", "17", "18"],
        "50": ["16", "17"],
        "55": ["16", "17"],
        "60": ["16"],
        "65": ["15", "16", "16C"],
        "70": ["15"],
        "75": ["16C"]
    },
    "215": {
        "40": ["17", "18"],
        "45": ["17", "18"],
        "50": ["17", "18"],
        "55": ["16", "17", "18"],
        "60": ["16", "17"],
        "65": ["16", "16C"],
        "70": ["15", "16"],
        "75": ["16C"]
    },
    "225": {
        "35": ["19", "20"],
        "40": ["18", "19"],
        "45": ["17", "18", "19"],
        "50": ["17", "18"],
        "55": ["17", "18", "19"],
        "60": ["17", "18"],
        "65": ["17", "17C"],
        "70": ["15", "16"],
        "75": ["16C"]
    },
    "235": {
        "35": ["19", "20"],
        "40": ["18", "19"],
        "45": ["17", "18", "19", "20"],
        "50": ["18", "19"],
        "55": ["17", "18", "19", "20"],
        "60": ["17", "18"],
        "65": ["16", "16C", "17", "18"],
        "70": ["16"]
    },
    "245": {
        "35": ["19", "20"],
        "40": ["18", "19", "20"],
        "45": ["17", "18", "19", "20"],
        "70": ["16", "17"]
    },
    "255": {
        "35": ["18", "19", "20"],
        "40": ["18", "19", "20", "21"],
        "45": ["18", "19", "20"],
        "50": ["19", "20"],
        "55": ["18", "19", "20"]
    },
    "265": {
        "35": ["19", "20", "21", "22"],
        "60": ["18"],
        "65": ["17", "18"],
        "70": ["15", "16", "17"],
        "75": ["16"]
    },
    "285": {
        "30": ["20", "21", "22"],
        "35": ["19", "20", "21", "22"],
        "70": ["16", "17"],
        "75": ["16"]
    },
    "305": {
        "30": ["21", "22"],
        "70": ["17", "18"]
    }
};

export default function SmartTireSize() {
    const [width, setWidth] = useState("");
    const [aspectRatio, setAspectRatio] = useState("");
    const [rim, setRim] = useState("");

    const [isOtherWidth, setIsOtherWidth] = useState(false);
    const [isOtherAspectRatio, setIsOtherAspectRatio] = useState(false);
    const [isOtherRim, setIsOtherRim] = useState(false);

    // Filter available options based on current selection
    const availableAspectRatios = width && tireMatrix[width] ? Object.keys(tireMatrix[width]) : [];
    const availableRims = width && aspectRatio && tireMatrix[width][aspectRatio] ? tireMatrix[width][aspectRatio] : [];

    // Reset dependent fields when parent changes
    useEffect(() => {
        if (!isOtherWidth) {
            setAspectRatio("");
            setIsOtherAspectRatio(false);
            setRim("");
            setIsOtherRim(false);
        }
    }, [width, isOtherWidth]);

    useEffect(() => {
        if (!isOtherAspectRatio) {
            setRim("");
            setIsOtherRim(false);
        }
    }, [aspectRatio, isOtherAspectRatio]);

    return (
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Genişlik */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-white/70">Genişlik</label>
                <select
                    name="genislik_select"
                    required
                    value={isOtherWidth ? "Diğer" : width}
                    onChange={(e) => {
                        if (e.target.value === "Diğer") {
                            setIsOtherWidth(true);
                            setWidth("");
                        } else {
                            setIsOtherWidth(false);
                            setWidth(e.target.value);
                        }
                    }}
                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold"
                >
                    <option value="">Seçiniz</option>
                    {Object.keys(tireMatrix).map(w => <option key={w} value={w}>{w}</option>)}
                    <option value="Diğer">Diğer</option>
                </select>
                {isOtherWidth && (
                    <input
                        name="genislik_other"
                        type="text"
                        placeholder="Genişlik..."
                        required
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold animate-in fade-in slide-in-from-top-1"
                    />
                )}
            </div>

            {/* Yanak (Aspect Ratio) */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-white/70">Yanak</label>
                <select
                    name="yanak_select"
                    required
                    disabled={!width && !isOtherWidth}
                    value={isOtherAspectRatio ? "Diğer" : aspectRatio}
                    onChange={(e) => {
                        if (e.target.value === "Diğer") {
                            setIsOtherAspectRatio(true);
                            setAspectRatio("");
                        } else {
                            setIsOtherAspectRatio(false);
                            setAspectRatio(e.target.value);
                        }
                    }}
                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
                >
                    <option value="">Seçiniz</option>
                    {availableAspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                    <option value="Diğer">Diğer</option>
                </select>
                {isOtherAspectRatio && (
                    <input
                        name="yanak_other"
                        type="text"
                        placeholder="Yanak..."
                        required
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold animate-in fade-in slide-in-from-top-1"
                    />
                )}
            </div>

            {/* Jant (Rim) */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-white/70">Jant</label>
                <select
                    name="jant_select"
                    required
                    disabled={(!aspectRatio && !isOtherAspectRatio) && !isOtherWidth}
                    value={isOtherRim ? "Diğer" : rim}
                    onChange={(e) => {
                        if (e.target.value === "Diğer") {
                            setIsOtherRim(true);
                            setRim("");
                        } else {
                            setIsOtherRim(false);
                            setRim(e.target.value);
                        }
                    }}
                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
                >
                    <option value="">Seçiniz</option>
                    {availableRims.map(r => <option key={r} value={r}>R{r}</option>)}
                    <option value="Diğer">Diğer</option>
                </select>
                {isOtherRim && (
                    <input
                        name="jant_other"
                        type="text"
                        placeholder="Jant... (örn: 16R)"
                        required
                        className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold animate-in fade-in slide-in-from-top-1"
                    />
                )}
            </div>
        </div>
    );
}
