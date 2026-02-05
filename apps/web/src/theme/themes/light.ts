import type { ThemeDefinition } from "../types";

/**
 * Light tema renk tanımlamaları
 * OKLCH renk uzayı kullanılıyor
 */
export const lightTheme: ThemeDefinition = {
  name: "light",
  colors: {
    // Arka planlar
    background: "oklch(0.98 0.005 260)",      // Çok açık gri
    surface: "oklch(1 0 0)",                   // Beyaz
    surfaceElevated: "oklch(0.97 0.005 260)", // Açık gri
    surfaceHover: "oklch(0.94 0.008 260)",    // Hover gri

    // Metinler
    foreground: "oklch(0.15 0.02 260)",       // Koyu slate
    muted: "oklch(0.45 0.02 260)",            // Orta slate
    mutedForeground: "oklch(0.35 0.02 260)",  // Koyu orta slate
    subtle: "oklch(0.55 0.02 260)",           // Açık slate

    // Border'lar
    border: "oklch(0.88 0.01 260)",           // Açık border
    borderSubtle: "oklch(0.92 0.008 260)",    // Çok açık border

    // Primary (palete göre override edilir)
    primary: "oklch(0.55 0.25 290)",
    primaryHover: "oklch(0.50 0.27 290)",
    primaryForeground: "oklch(1 0 0)",

    // Accent (palete göre override edilir)
    accent: "oklch(0.60 0.20 290)",
    accentForeground: "oklch(0.95 0.02 290)",

    // Semantic renkler
    success: "oklch(0.55 0.18 145)",
    successForeground: "oklch(0.30 0.10 145)",
    warning: "oklch(0.70 0.18 85)",
    warningForeground: "oklch(0.30 0.10 85)",
    error: "oklch(0.55 0.22 25)",
    errorForeground: "oklch(0.30 0.10 25)",
    info: "oklch(0.55 0.15 250)",
    infoForeground: "oklch(0.30 0.08 250)",
  },
};
