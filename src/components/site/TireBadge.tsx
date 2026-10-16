import Link from "next/link";

// Sitenin imza öğesi: üzerinde "RANDEVU AL" yazan, yavaşça dönen bir lastik.
// Dış halkadaki çentikler lastik sırtı (tırtıl) gibi görünür.
export default function TireBadge({ className = "" }: { className?: string }) {
  const tread = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <Link
      href="/randevu"
      aria-label="Randevu al"
      className={`group block aspect-square rounded-full transition-transform duration-300 hover:scale-105 active:scale-95 ${className || "relative"}`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow group-hover:[animation-play-state:paused]">
        <defs>
          <path id="tb-text" d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
        </defs>
        {/* lastik gövdesi */}
        <circle cx="100" cy="100" r="96" fill="#141312" />
        {/* sırt çentikleri */}
        {tread.map((deg) => (
          <rect
            key={deg}
            x="96"
            y="4"
            width="8"
            height="14"
            rx="2"
            fill="#2a2825"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
        {/* sarı yazı bandı */}
        <circle cx="100" cy="100" r="78" fill="#FACC15" />
        <text fontSize="15" fontWeight="800" fill="#141312" style={{ fontFamily: "var(--font-display)" }}>
          <textPath href="#tb-text" textLength="408" lengthAdjust="spacing">
            RANDEVU AL • RANDEVU AL • RANDEVU AL •
          </textPath>
        </text>
        {/* jant */}
        <circle cx="100" cy="100" r="50" fill="#141312" />
        <circle cx="100" cy="100" r="44" fill="none" stroke="#3a3733" strokeWidth="2" />
      </svg>
      {/* ortadaki ok dönmez */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-[22%] w-[22%] text-brand-gold transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </span>
    </Link>
  );
}
