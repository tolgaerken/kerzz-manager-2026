/**
 * Semantic renk token'ları
 * Bu değerler CSS değişkenlerine karşılık gelir
 */

/** Semantic renk token isimleri */
export const colorTokens = {
  // Arka planlar
  background: "--color-background",
  surface: "--color-surface",
  surfaceElevated: "--color-surface-elevated",
  surfaceHover: "--color-surface-hover",

  // Metinler
  foreground: "--color-foreground",
  muted: "--color-muted",
  mutedForeground: "--color-muted-foreground",
  subtle: "--color-subtle",

  // Border'lar
  border: "--color-border",
  borderSubtle: "--color-border-subtle",

  // Primary
  primary: "--color-primary",
  primaryHover: "--color-primary-hover",
  primaryForeground: "--color-primary-foreground",

  // Accent
  accent: "--color-accent",
  accentForeground: "--color-accent-foreground",

  // Semantic
  success: "--color-success",
  successForeground: "--color-success-foreground",
  warning: "--color-warning",
  warningForeground: "--color-warning-foreground",
  error: "--color-error",
  errorForeground: "--color-error-foreground",
  info: "--color-info",
  infoForeground: "--color-info-foreground",
} as const;

/** Semantic renkler (tema bağımsız) */
export const semanticColors = {
  success: {
    base: "oklch(0.70 0.18 145)",
    foreground: "oklch(0.35 0.10 145)",
  },
  warning: {
    base: "oklch(0.80 0.18 85)",
    foreground: "oklch(0.35 0.10 85)",
  },
  error: {
    base: "oklch(0.65 0.22 25)",
    foreground: "oklch(0.35 0.10 25)",
  },
  info: {
    base: "oklch(0.70 0.15 250)",
    foreground: "oklch(0.35 0.08 250)",
  },
};
