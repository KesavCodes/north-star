export const theme = {
  colors: {
    // Primary Accents
    primary: "#0F766E", // Slate Teal
    primaryLight: "#CCFBF1",
    emerald: "#10B981", // Soft Emerald
    emeraldLight: "#D1FAE5",
    indigo: "#4F46E5", // Slate Indigo
    indigoLight: "#EEF2FF",

    // Neutrals & Surfaces
    background: "#FAFAFA", // Warm Off-White
    surface: "#FFFFFF", // Card White
    surfaceSecondary: "#F1F5F9", // Slate Tint
    border: "#E2E8F0", // Soft Border
    borderMuted: "#F1F5F9",
    darkOverlay: "rgba(15, 23, 42, 0.6)",

    // Typography
    textPrimary: "#0F172A", // Slate 900
    textSecondary: "#334155", // Slate 700
    textMuted: "#64748B", // Slate 500
    textSubtle: "#94A3B8", // Slate 400

    // Emotions (Subtle Tones)
    mood: {
      great: { emoji: "😄", label: "Great", score: 5, color: "#10B981", bg: "#D1FAE5" },
      good: { emoji: "🙂", label: "Good", score: 4, color: "#3B82F6", bg: "#DBEAFE" },
      okay: { emoji: "😐", label: "Okay", score: 3, color: "#64748B", bg: "#F1F5F9" },
      bad: { emoji: "🙁", label: "Bad", score: 2, color: "#F59E0B", bg: "#FEF3C7" },
      awful: { emoji: "😭", label: "Awful", score: 1, color: "#EF4444", bg: "#FEE2E2" },
    },
  },
  shadows: {
    card: "shadow-sm border border-slate-100",
    button: "shadow-xs",
  },
};
