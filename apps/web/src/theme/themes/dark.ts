import type { ThemeDefinition } from "../types";

/**
 * Dark tema renk tanımlamaları
 * OKLCH renk uzayı kullanılıyor
 */
export const darkTheme: ThemeDefinition = {
  name: "dark",
  colors: {
    // Arka planlar
    background: "oklch(0.13 0.02 260)",       // slate-950
    surface: "oklch(0.16 0.02 260)",          // slate-900
    surfaceElevated: "oklch(0.21 0.02 260)",  // slate-800
    surfaceHover: "oklch(0.27 0.02 260)",     // slate-700

    // Metinler
    foreground: "oklch(1 0 0)",               // white
    muted: "oklch(0.70 0.02 260)",            // slate-400
    mutedForeground: "oklch(0.77 0.02 260)",  // slate-300
    subtle: "oklch(0.55 0.02 260)",           // slate-500

    // Border'lar
    border: "oklch(0.21 0.02 260)",           // slate-800
    borderSubtle: "oklch(0.27 0.02 260)",     // slate-700

    // Primary (palete göre override edilir)
    primary: "oklch(0.65 0.25 290)",
    primaryHover: "oklch(0.60 0.27 290)",
    primaryForeground: "oklch(1 0 0)",

    // Accent (palete göre override edilir)
    accent: "oklch(0.70 0.20 290)",
    accentForeground: "oklch(0.20 0.05 290)",

    // Semantic renkler
    success: "oklch(0.70 0.18 145)",
    successForeground: "oklch(0.85 0.12 145)",
    warning: "oklch(0.80 0.18 85)",
    warningForeground: "oklch(0.90 0.12 85)",
    error: "oklch(0.65 0.22 25)",
    errorForeground: "oklch(0.85 0.15 25)",
    info: "oklch(0.70 0.15 250)",
    infoForeground: "oklch(0.85 0.10 250)",
  },
};
