import React, { createContext, useContext, useMemo } from 'react';
import type { GridTheme, ResolvedGridTheme } from '../types/theme.types';
import { createTheme } from './createTheme';
import { lightTheme } from './themes/light';

/**
 * ThemeContext value.
 * isAuto: true ise grid global tema CSS değişkenlerinden renk alır (inline override yok).
 * false ise explicit theme prop üzerinden inline CSS vars uygulanır.
 */
interface ThemeContextValue {
  theme: ResolvedGridTheme;
  isAuto: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isAuto: true,
});

/** Çözümlenmiş grid temasını döndürür (spacing, font vb. için) */
export function useGridTheme(): ResolvedGridTheme {
  return useContext(ThemeContext).theme;
}

/**
 * Grid'in global temadan mı (auto) yoksa explicit prop'tan mı renk aldığını döndürür.
 * true ise inline CSS variable override uygulanmaz — grid, global --theme-* değişkenlerini kullanır.
 */
export function useIsAutoTheme(): boolean {
  return useContext(ThemeContext).isAuto;
}

export interface ThemeProviderProps {
  theme?: GridTheme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: theme ? createTheme(theme) : lightTheme,
      isAuto: theme === undefined,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
