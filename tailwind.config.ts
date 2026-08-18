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
