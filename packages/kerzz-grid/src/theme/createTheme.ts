import type { GridTheme, ResolvedGridTheme } from '../types/theme.types';
import { lightTheme } from './themes/light';

/**
 * Creates a resolved theme by deep-merging user overrides with the default light theme.
 */
export function createTheme(overrides: GridTheme): ResolvedGridTheme {
  return {
    colors: { ...lightTheme.colors, ...overrides.colors },
    fontSize: { ...lightTheme.fontSize, ...overrides.fontSize },
    spacing: { ...lightTheme.spacing, ...overrides.spacing },
    border: { ...lightTheme.border, ...overrides.border },
    fontFamily: overrides.fontFamily ?? lightTheme.fontFamily,
  };
}
