/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
theme: {
    extend: {
      colors: {
        // ─── Education Primary ─────────────────────
        primary: {
          DEFAULT: "#0F766E", // Deep Emerald
          hover: "#115E59",   // Darker Emerald
          light: "#CCFBF1",   // Very Light Teal
        },

        // ─── Brand ─────────────────────────────────
        brand: {
          primary: "#0F766E",
          hover: "#115E59",
          accent: "#F59E0B", // Warm Amber
        },

        // ─── Accent ────────────────────────────────
        accent: "#F59E0B",

        // ─── UI ────────────────────────────────────
        background: "#F8FAFC",
        surface: "#FFFFFF",

        // ─── Typography ────────────────────────────
        "text-main": "#0F172A",
        muted: "#64748B",

        // ─── Feedback ──────────────────────────────
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",

        // ─── Borders ──────────────────────────────
        border: "#E2E8F0",
      },

      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans Arabic",
          "Hind Siliguri",
          "system-ui",
          "sans-serif",
        ],

        arabic: [
          "Noto Sans Arabic",
          "system-ui",
          "sans-serif",
        ],

        bangla: [
          "Hind Siliguri",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}