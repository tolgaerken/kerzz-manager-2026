import React, { createContext, useContext, useMemo } from 'react';
import type { GridTheme, ResolvedGridTheme } from '../types/theme.types';
import { createTheme } from './createTheme';
import { lightTheme } from './themes/light';

const ThemeContext = createContext<ResolvedGridTheme>(lightTheme);

export function useGridTheme(): ResolvedGridTheme {
  return useContext(ThemeContext);
}

export interface ThemeProviderProps {
  theme?: GridTheme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const resolvedTheme = useMemo(
    () => (theme ? createTheme(theme) : lightTheme),
    [theme],
  );

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
