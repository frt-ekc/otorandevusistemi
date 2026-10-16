"use client";

import { useEffect, useState } from "react";

// Siteye ilk girişte tam ekran açılış: harfler sırayla aşağıdan yükselir,
// altında sarı çizgi uzar, sonra perde yukarı toplanır. Oturumda bir kez oynar.
// Daha önce görüldüyse ya da hareket azaltma açıksa IntroGate betiği
// <html data-intro-seen> koyar ve CSS katmanı hiç göstermez (flaş olmaz).

export const INTRO_KEY = "fol_intro";
const TEXT = "Fırat Oto Lastik";
const TOTAL_MS = 2700;

// Boyamadan önce çalışan küçük betik: görülmüşse katmanı CSS ile gizler.
export function IntroGate() {
  const js = `try{if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

export default function SiteIntro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let seen = root.hasAttribute("data-intro-seen");
    try {
      seen = seen || sessionStorage.getItem(INTRO_KEY) !== null;
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    if (seen) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  let i = 0;
  return (
    <div className="site-intro fixed inset-0 z-[100] grid place-items-center bg-brand-dark" aria-hidden="true">
      <div className="flex flex-col items-center px-4">
        <div className="flex flex-wrap justify-center gap-x-[0.3em] font-display text-[clamp(2rem,9vw,3.75rem)] font-bold leading-tight text-brand-text [font-stretch:112%]">
          {TEXT.split(" ").map((word) => (
            <span key={word} className="flex overflow-hidden">
              {[...word].map((ch, idx) => (
                <span key={idx} className="site-intro__char" style={{ "--i": i++ } as React.CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </div>
        <span className="site-intro__line mt-4 h-px w-40 bg-brand-gold" />
      </div>
    </div>
  );
}
