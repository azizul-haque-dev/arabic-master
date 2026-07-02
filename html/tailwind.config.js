/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./auth/**/*.html",
    "./onboarding/**/*.html",
    "./public/**/*.html",
    "./assets/app.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ec4899",
          hover: "#db2777",
          light: "#fce7f3",
        },
        brand: {
          primary: "#ec4899",
          hover: "#db2777",
          accent: "#a855f7",
        },
        accent: "#a855f7",
        background: "#fafafa",
        surface: "#ffffff",
        "text-main": "#111827",
        muted: "#6b7280",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans Arabic",
          "Hind Siliguri",
          "system-ui",
          "sans-serif",
        ],
        arabic: ["Noto Sans Arabic", "system-ui", "sans-serif"],
        bangla: ["Hind Siliguri", "system-ui", "sans-serif"],
      },
    },
  },
};
