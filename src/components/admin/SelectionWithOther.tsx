"use client";

import { useState } from "react";

interface SelectionWithOtherProps {
    name: string;
    label: string;
    options: string[];
    placeholder?: string;
    required?: boolean;
}

export default function SelectionWithOther({
    name,
    label,
    options,
    placeholder = "Seçiniz",
    required = false,
}: SelectionWithOtherProps) {
    const [selected, setSelected] = useState("");
    const isOther = selected === "Diğer";

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">{label}</label>
            <select
                name={`${name}_select`}
                required={required}
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
                <option value="Diğer">Diğer</option>
            </select>

            {isOther && (
                <input
                    name={`${name}_other`}
                    type="text"
                    placeholder={`${label} yazınız...`}
                    required={required}
                    className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold animate-in fade-in slide-in-from-top-2 duration-300"
                />
            )}
        </div>
    );
}
