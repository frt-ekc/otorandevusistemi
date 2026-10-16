// Eğik sarı şerit üzerinde kayan hizmet adları (afişteki şerit gibi)
export default function MarqueeBand({ items, tilt = -2.5 }: { items: string[]; tilt?: number }) {
  const row = [...items, ...items];
  return (
    <div className="relative -mx-4 overflow-hidden py-6 sm:-mx-6" aria-hidden="true">
      <div className="bg-brand-gold py-3 shadow-[0_10px_40px_rgba(250,204,21,0.15)]" style={{ transform: `rotate(${tilt}deg) scale(1.04)` }}>
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {row.map((item, i) => (
                <span key={`${copy}-${i}`} className="flex items-center whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-tight text-brand-dark sm:text-2xl">
                  <span className="px-5">{item}</span>
                  <TireDot />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TireDot() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5">
      <circle cx="10" cy="10" r="9" fill="#141312" />
      <circle cx="10" cy="10" r="4" fill="#FACC15" />
    </svg>
  );
}
