import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institutional dark palette
        bg: {
          primary: "#070708",
          secondary: "#0E0E10",
          card: "#111114",
          hover: "#16161A",
          border: "#1E1E24",
        },
        maroon: {
          50: "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#ff6b6b",
          500: "#f83b3b",
          600: "#e51b1b",
          700: "#c11212",
          800: "#8B0000",
          900: "#6B0000",
          950: "#450000",
        },
        ivory: {
          50: "#FDFBF7",
          100: "#F8F4EB",
          200: "#F0E8D4",
          300: "#E5D9B6",
          400: "#D4C48A",
          500: "#B8A870",
          600: "#9C8C58",
          700: "#7A6E42",
          800: "#5C5233",
          900: "#3D3622",
        },
        gold: {
          400: "#FFD700",
          500: "#DAA520",
          600: "#B8860B",
          700: "#8B6914",
        },
        signal: {
          bull: "#00E676",
          bear: "#FF1744",
          neutral: "#FFB300",
          accumulate: "#00BCD4",
          distribute: "#FF5722",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker-scroll": "ticker 30s linear infinite",
        "glow-pulse": "glow 2s ease-in-out infinite alternate",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        glow: {
          from: { boxShadow: "0 0 5px #8B0000, 0 0 10px #8B0000" },
          to: { boxShadow: "0 0 10px #8B0000, 0 0 20px #8B0000, 0 0 30px #8B000066" },
        },
        slideIn: {
          from: { transform: "translateX(-10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-maroon": "linear-gradient(135deg, #8B0000 0%, #3D0000 100%)",
        "gradient-card": "linear-gradient(145deg, #111114 0%, #0E0E10 100%)",
        "gradient-glow": "radial-gradient(ellipse at top, #8B000022 0%, transparent 60%)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,0,0,0.15)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.9), 0 0 0 1px rgba(139,0,0,0.4)",
        "glow-maroon": "0 0 20px rgba(139,0,0,0.3)",
        "glow-bull": "0 0 15px rgba(0,230,118,0.2)",
        "glow-bear": "0 0 15px rgba(255,23,68,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
