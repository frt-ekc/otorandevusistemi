import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",
          slate: "#1f2937",
          night: "#111827",
          accent: "#ef4444",
          gold: "#facc15"
        }
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0, 0, 0, 0.35)",
        soft: "0 12px 30px rgba(15, 23, 42, 0.35)"
      },
      backdropBlur: {
        glass: "18px"
      }
    }
  },
  plugins: []
};

export default config;
