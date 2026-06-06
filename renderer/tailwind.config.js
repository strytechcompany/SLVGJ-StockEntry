/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./renderer/index.html",
    "./renderer/src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand pink (a brighter, more saturated pink than rose-500)
        primary: {
          50:  "#FFF1F6",
          100: "#FFE0EC",
          200: "#FFC2D9",
          300: "#FF9CC0",
          400: "#FB6FA3",
          500: "#EC4899", // base
          600: "#DB2777",
          700: "#BE185D", // hover / pressed
          800: "#9D174D",
          900: "#6B0F37",
        },
        // Cream — the contrasting surface
        cream: {
          50:  "#FFFBF7", // page background
          100: "#FFF6EE", // card surface
          200: "#FBEADF", // subtle borders
          300: "#F4D6C2",
        },
        // Text on cream
        ink: {
          900: "#2A1620",
          700: "#553344",
          500: "#8A6B7A",
          300: "#B89AA8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(190, 24, 93, 0.06)",
        soft: "0 4px 24px 0 rgba(236, 72, 153, 0.10)",
        glow: "0 6px 28px 0 rgba(236, 72, 153, 0.22)",
        float: "0 10px 36px 0 rgba(190, 24, 93, 0.18)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.35s ease-out both",
        "scale-in": "scaleIn 0.25s ease-out both",
        "slide-in-right": "slideInRight 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
