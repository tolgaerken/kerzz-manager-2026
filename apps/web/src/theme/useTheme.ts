import { useThemeStore } from "./themeStore";
import { palettes, paletteList } from "./palettes";
import type { ThemeMode, ColorPalette } from "./types";

/**
 * Tema hook'u
 * Tema state'ine ve aksiyonlarına erişim sağlar
 */
export function useTheme() {
  const { mode, palette, resolvedMode, setMode, setPalette } = useThemeStore();

  return {
    // State
    mode,
    palette,
    resolvedMode,
    isDark: resolvedMode === "dark",
    isLight: resolvedMode === "light",
    isSystem: mode === "system",

    // Palet bilgileri
    currentPalette: palettes[palette],
    availablePalettes: paletteList,

    // Actions
    setMode,
    setPalette,

    // Convenience actions
    toggleMode: () => {
      const newMode: ThemeMode = resolvedMode === "dark" ? "light" : "dark";
      setMode(newMode);
    },
    setSystemMode: () => setMode("system"),
    setDarkMode: () => setMode("dark"),
    setLightMode: () => setMode("light"),
  };
}

/** Tema modları listesi (UI için) */
export const themeModes: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Sistem" },
  { value: "light", label: "Açık" },
  { value: "dark", label: "Koyu" },
];
