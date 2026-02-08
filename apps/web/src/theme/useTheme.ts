import { useThemeStore, getPresetList } from "@kerzz/ui-theme";

/**
 * Tema hook'u
 * @kerzz/ui-theme store'unu sarmalayarak bileşenler için kullanışlı bir API sağlar
 */
export function useTheme() {
  const store = useThemeStore();

  return {
    // Tema modu durumu
    isDark: store.isDark,
    isLight: !store.isDark,

    // Aktif preset bilgileri
    activePresetId: store.activePresetId,
    activePreset: store.getActivePreset(),

    // Mevcut preset listesi
    availablePresets: getPresetList(),

    // Aksiyonlar
    setDark: store.setDark,
    toggleTheme: store.toggleTheme,
    setPreset: store.setPreset,
  };
}

/**
 * Tema modları listesi (UI için)
 */
export const themeModes = [
  { value: "dark", label: "Koyu" },
  { value: "light", label: "Açık" },
];
