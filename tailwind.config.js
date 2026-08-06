/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F766E",      // Muted Slate Teal
          primaryLight: "#CCFBF1", // Light Teal Tint
          emerald: "#10B981",      // Soft Emerald
          emeraldLight: "#D1FAE5",
          indigo: "#4F46E5",       // Slate Indigo
          indigoLight: "#EEF2FF",
          bg: "#F8F9FA",           // Clean Off-White Background
          surface: "#FFFFFF",      // Card Pure White
          slateBg: "#F1F5F9",      // Soft Slate Surface
          border: "#E2E8F0",       // Soft Border
          borderSubtle: "#F1F5F9",
          heading: "#0F172A",      // Dark Slate 900
          body: "#334155",         // Slate 700
          muted: "#64748B",        // Slate 500
          subtle: "#94A3B8",       // Slate 400
        },
      },
    },
  },
  plugins: [],
};
