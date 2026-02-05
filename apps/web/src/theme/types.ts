/**
 * Tema sistemi tip tanımlamaları
 */

/** Desteklenen tema modları */
export type ThemeMode = "light" | "dark" | "system";

/** Desteklenen renk paletleri */
export type ColorPalette = "purple" | "blue" | "teal" | "rose";

/** Tema state interface'i */
export interface ThemeState {
  mode: ThemeMode;
  palette: ColorPalette;
  resolvedMode: "light" | "dark";
}

/** Tema actions interface'i */
export interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ColorPalette) => void;
}

/** Tema store interface'i (state + actions) */
export type ThemeStore = ThemeState & ThemeActions;

/** Renk paleti tanımı */
export interface PaletteDefinition {
  name: string;
  label: string;
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
}

/** Tema renk token'ları */
export interface ThemeColors {
  // Arka planlar
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;

  // Metinler
  foreground: string;
  muted: string;
  mutedForeground: string;
  subtle: string;

  // Border'lar
  border: string;
  borderSubtle: string;

  // Primary (palete göre değişir)
  primary: string;
  primaryHover: string;
  primaryForeground: string;

  // Accent (palete göre değişir)
  accent: string;
  accentForeground: string;

  // Semantic renkler
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
}

/** Tema tanımı */
export interface ThemeDefinition {
  name: string;
  colors: ThemeColors;
}
