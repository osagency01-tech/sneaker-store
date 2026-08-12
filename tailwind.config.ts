import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Encre = noir pur pour les gros titres façon référence
        ink: {
          DEFAULT: "#0B0B0F",
          soft: "#3A3D47",
          faint: "#7C8090",
        },
        // Papier = blanc + brume lavande très claire
        paper: {
          DEFAULT: "#FFFFFF",
          soft: "#F4F5FA",     // gris-lavande très clair
          line: "#E8E9F2",
        },
        // Brume du hero (dégradé)
        haze: {
          from: "#E9E8F6",     // lavande clair
          to: "#FBFBFE",       // presque blanc
        },
        // Accent lavande-encre conservé
        accent: {
          DEFAULT: "#5B57D1",  // indigo-lavande vif (boutons, liens)
          soft: "#ECEBFB",
          ink: "#3D3A9E",
        },
        ok: "#1F7A54",
        warn: "#B4791F",
        danger: "#B23A48",
      },
      fontFamily: {
        // Inter partout ; le mono reste pour les données techniques
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "22px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(20,21,26,.05), 0 12px 32px rgba(20,21,26,.08)",
        float: "0 30px 60px -20px rgba(70,64,140,.35)",  // ombre douce sous la sneaker
        pop: "0 16px 48px rgba(20,21,26,.16)",
      },
      maxWidth: { app: "1200px" },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0) rotate(-8deg)" },
          "50%": { transform: "translateY(-18px) rotate(-8deg)" },
        },
        floatyShadow: {
          "0%, 100%": { transform: "scaleX(1)", opacity: "0.35" },
          "50%": { transform: "scaleX(0.82)", opacity: "0.22" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floaty: "floaty 4.5s ease-in-out infinite",
        floatyShadow: "floatyShadow 4.5s ease-in-out infinite",
        fadeUp: "fadeUp .6s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
