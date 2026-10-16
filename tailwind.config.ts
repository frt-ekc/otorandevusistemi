import type { Config } from "tailwindcss";

// Tasarım dili: asfalt siyahı zemin + tabela sarısı vurgu (sendika afişiyle aynı sarı)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#141312", // asfalt (ana zemin, sarı buton üstündeki yazı)
          slate: "#1D1C1A", // yüzey (kartlar)
          night: "#1D1C1A", // form alanları
          line: "rgba(255,255,255,0.08)",
          text: "#EEEAE3",
          muted: "#A39C90",
          accent: "#ef4444",
          gold: "#FACC15" // tabela sarısı
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0, 0, 0, 0.35)",
        soft: "0 12px 30px rgba(0, 0, 0, 0.35)"
      },
      backdropBlur: {
        glass: "18px"
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        rise: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        rise: "rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
