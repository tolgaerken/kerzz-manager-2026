import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode, ColorPalette, ThemeStore } from "./types";

/** Sistem tema tercihini algıla */
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Resolved mode hesapla */
function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
}

/** Temayı DOM'a uygula */
function applyTheme(mode: ThemeMode, palette: ColorPalette) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const resolvedMode = resolveMode(mode);

  // Tüm tema ve palet class'larını temizle
  root.classList.remove("light", "dark");
  root.classList.remove("palette-purple", "palette-blue", "palette-teal", "palette-rose");

  // Yeni class'ları ekle
  if (resolvedMode === "light") {
    root.classList.add("light");
  }
  // Dark varsayılan olduğu için class eklemeye gerek yok

  root.classList.add(`palette-${palette}`);
}

/** Tema store'u */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "system",
      palette: "purple",
      resolvedMode: getSystemTheme(),

      setMode: (mode: ThemeMode) => {
        const resolvedMode = resolveMode(mode);
        applyTheme(mode, get().palette);
        set({ mode, resolvedMode });
      },

      setPalette: (palette: ColorPalette) => {
        applyTheme(get().mode, palette);
        set({ palette });
      },
    }),
    {
      name: "kerzz-theme",
      partialize: (state) => ({
        mode: state.mode,
        palette: state.palette,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sayfa yüklendiğinde temayı uygula
          applyTheme(state.mode, state.palette);
          // Resolved mode'u güncelle
          state.resolvedMode = resolveMode(state.mode);
        }
      },
    }
  )
);

/** Sistem tema değişikliklerini dinle */
if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  mediaQuery.addEventListener("change", () => {
    const { mode, palette, setMode } = useThemeStore.getState();
    if (mode === "system") {
      // Sadece sistem modundaysa güncelle
      applyTheme(mode, palette);
      useThemeStore.setState({ resolvedMode: getSystemTheme() });
    }
  });
}
