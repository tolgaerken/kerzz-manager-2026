/**
 * Tema Modülü
 * @kerzz/ui-theme paketini bridge katmanı ile projeye entegre eder
 */

// Bridge Provider
export { ThemeProvider } from "./ThemeProvider";

// Local hook (ui-theme store'u sarar)
export { useTheme, themeModes } from "./useTheme";

// Re-export: ui-theme store ve tipleri
export { useThemeStore } from "@kerzz/ui-theme";
export type { ThemeState } from "@kerzz/ui-theme";

// Re-export: Preset'ler
export { getPreset, getPresetList, getPresetIds, getSemanticColors, presets, DEFAULT_PRESET_ID } from "@kerzz/ui-theme";
export type { ThemePreset, ThemeSemanticColors } from "@kerzz/ui-theme";

// Re-export: Token'lar
export { semanticColors } from "@kerzz/ui-theme";

// Re-export: Sidebar store
export { useSidebarStore } from "@kerzz/ui-theme";
