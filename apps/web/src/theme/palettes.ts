import type { ColorPalette, PaletteDefinition } from "./types";

/**
 * Renk paletleri tanımlamaları
 * OKLCH renk uzayı kullanılıyor (modern, algısal olarak düzgün)
 */
export const palettes: Record<ColorPalette, PaletteDefinition> = {
  purple: {
    name: "purple",
    label: "Mor",
    primary: "oklch(0.65 0.25 290)",
    primaryHover: "oklch(0.60 0.27 290)",
    primaryForeground: "oklch(1 0 0)",
    accent: "oklch(0.70 0.20 290)",
    accentForeground: "oklch(0.20 0.05 290)",
  },
  blue: {
    name: "blue",
    label: "Mavi",
    primary: "oklch(0.60 0.20 250)",
    primaryHover: "oklch(0.55 0.22 250)",
    primaryForeground: "oklch(1 0 0)",
    accent: "oklch(0.70 0.15 250)",
    accentForeground: "oklch(0.20 0.05 250)",
  },
  teal: {
    name: "teal",
    label: "Turkuaz",
    primary: "oklch(0.70 0.15 180)",
    primaryHover: "oklch(0.65 0.17 180)",
    primaryForeground: "oklch(0.15 0.02 180)",
    accent: "oklch(0.75 0.12 180)",
    accentForeground: "oklch(0.20 0.05 180)",
  },
  rose: {
    name: "rose",
    label: "Gül",
    primary: "oklch(0.65 0.22 10)",
    primaryHover: "oklch(0.60 0.24 10)",
    primaryForeground: "oklch(1 0 0)",
    accent: "oklch(0.70 0.18 10)",
    accentForeground: "oklch(0.20 0.05 10)",
  },
};

/** Varsayılan palet */
export const defaultPalette: ColorPalette = "purple";

/** Palet listesi (UI için) */
export const paletteList = Object.values(palettes);
