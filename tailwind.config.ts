import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // `white` and `black` are re-pointed at theme variables so the existing
        // ~370 bg-black / text-white / border-white utilities theme themselves.
        // In this codebase they mean "foreground" and "background", not literal
        // colours. Text OPACITY tiers (text-white/40 etc.) cannot be made
        // WCAG-compliant on a light background by alpha alone, so globals.css
        // remaps each tier to a solid, contrast-checked colour under
        // [data-theme="light"].
        white: "rgb(var(--fq-fg) / <alpha-value>)",
        black: "rgb(var(--fq-bg) / <alpha-value>)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#0b0b0a",
        bone: "#ece9e2",
        "bone-e4": "#e4e0d8",
        brass: "#c39a5f",
        "brass-deep": "#8a6b3d",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-good-times)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fq-glimmer": {
          "0%": { left: "-150%" },
          "15%": { left: "150%" },
          "100%": { left: "150%" },
        },
        "fq-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        glimmer: "fq-glimmer 3.5s infinite",
        marquee: "fq-marquee 34s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
