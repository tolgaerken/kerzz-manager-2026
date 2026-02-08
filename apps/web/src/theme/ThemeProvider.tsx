import { useEffect, type ReactNode } from "react";
import { useThemeStore, getSemanticColors } from "@kerzz/ui-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Tema Provider komponenti
 * @kerzz/ui-theme store'undan aktif preset'i okur ve CSS değişkenlerine uygular
 * Bu komponent ui-theme'in JS tabanlı preset sistemini mevcut Tailwind CSS değişken sistemine bağlar
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDark, activePresetId, getActivePreset } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const preset = getActivePreset();
    const semanticColors = getSemanticColors(activePresetId);

    // Aktif renkleri seç (dark veya light mode'a göre)
    const colors = isDark ? preset.colors.dark : preset.colors.light;
    const primaryColors = preset.colors.primary;

    // Dark/Light class yönetimi
    // Varsayılan dark mode (class yok), light mode için 'light' class ekle
    if (isDark) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }

    // Dark/Light mode renkleri
    root.style.setProperty("--theme-background", colors.bg);
    root.style.setProperty("--theme-surface", colors.card);
    root.style.setProperty("--theme-surface-elevated", colors.cardElevated);
    root.style.setProperty("--theme-surface-hover", colors.cardElevated); // cardElevated'i tekrar kullan
    root.style.setProperty("--theme-border", colors.border);
    root.style.setProperty("--theme-border-subtle", colors.borderLight);
    root.style.setProperty("--theme-foreground", colors.text);
    root.style.setProperty("--theme-muted-foreground", colors.textSecondary);
    root.style.setProperty("--theme-muted", colors.textMuted);
    root.style.setProperty("--theme-subtle", colors.textMuted); // textMuted'i tekrar kullan

    // Primary renkleri
    root.style.setProperty("--theme-primary", primaryColors[500]);
    root.style.setProperty("--theme-primary-hover", primaryColors[600]);
    root.style.setProperty("--theme-primary-foreground", "#ffffff"); // Her iki modda da beyaz
    root.style.setProperty("--theme-accent", primaryColors[400]);
    // Accent foreground: dark mode'da primary[950], light mode'da primary[50]
    root.style.setProperty(
      "--theme-accent-foreground",
      isDark ? primaryColors[950] : primaryColors[50]
    );

    // Semantic renkler
    // Success
    root.style.setProperty("--theme-success", semanticColors.success.main);
    root.style.setProperty(
      "--theme-success-foreground",
      isDark ? semanticColors.success.light : semanticColors.success.dark
    );

    // Warning
    root.style.setProperty("--theme-warning", semanticColors.warning.main);
    root.style.setProperty(
      "--theme-warning-foreground",
      isDark ? semanticColors.warning.light : semanticColors.warning.dark
    );

    // Error
    root.style.setProperty("--theme-error", semanticColors.error.main);
    root.style.setProperty(
      "--theme-error-foreground",
      isDark ? semanticColors.error.light : semanticColors.error.dark
    );

    // Info
    root.style.setProperty("--theme-info", semanticColors.info.main);
    root.style.setProperty(
      "--theme-info-foreground",
      isDark ? semanticColors.info.light : semanticColors.info.dark
    );
  }, [isDark, activePresetId, getActivePreset]);

  // Sistem renk şeması tercih değişikliklerini dinle (gelecekteki 'system' mod desteği için)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      // Sistem tercihi değiştiğinde burada işlem yapılabilir
      // Şu an için sadece dinliyoruz, gelecekte system mod eklendiğinde kullanılacak
    };

    // Media query listener ekle
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return <>{children}</>;
}
