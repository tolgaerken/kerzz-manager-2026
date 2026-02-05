import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "./themeStore";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Tema Provider komponenti
 * Uygulama başlatıldığında temayı DOM'a uygular
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, palette } = useThemeStore();

  useEffect(() => {
    // İlk render'da temayı uygula
    const root = document.documentElement;
    
    // Resolved mode hesapla
    const resolvedMode =
      mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : mode;

    // Class'ları ayarla
    root.classList.remove("light", "dark");
    root.classList.remove("palette-purple", "palette-blue", "palette-teal", "palette-rose");

    if (resolvedMode === "light") {
      root.classList.add("light");
    }

    root.classList.add(`palette-${palette}`);
  }, [mode, palette]);

  return <>{children}</>;
}
