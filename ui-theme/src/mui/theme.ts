import { createTheme, ThemeOptions } from '@mui/material';
import { getPreset, getSemanticColors, DEFAULT_PRESET_ID } from '../presets';
import type { ThemePreset } from '../presets/types';
import { semanticColors as defaultSemanticColors } from '../tokens/semantic';

export interface KerzzThemeOptions {
  isDark: boolean;
  presetId?: string;
  /** Doğrudan preset objesi (remote temalar için) */
  preset?: ThemePreset;
  direction?: 'ltr' | 'rtl';
  locale?: object;
  overrides?: ThemeOptions;
}

/**
 * Kerzz Cloud MUI Tema Factory
 * Tüm frontend projelerinde tutarlı MUI teması
 * Remote (DB'den) ve local preset'leri destekler
 */
export function createKerzzTheme(options: KerzzThemeOptions) {
  const { isDark, presetId = DEFAULT_PRESET_ID, preset: providedPreset, direction = 'ltr', locale, overrides } = options;

  // Aktif preset'i al - providedPreset varsa onu kullan, yoksa presetId ile getir
  const preset = providedPreset || getPreset(presetId);
  const colors = isDark ? preset.colors.dark : preset.colors.light;
  const primaryColors = preset.colors.primary;
  // Preset'in kendi semantic renkleri varsa onları kullan, yoksa default veya presetId'ye göre
  const semanticColors = preset.semantic || (providedPreset ? defaultSemanticColors : getSemanticColors(presetId));

  const baseTheme: ThemeOptions = {
    direction,
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: primaryColors[500],
        light: primaryColors[400],
        dark: primaryColors[600],
      },
      success: {
        main: semanticColors.success.main,
        light: semanticColors.success.light,
        dark: semanticColors.success.dark,
      },
      warning: {
        main: semanticColors.warning.main,
        light: semanticColors.warning.light,
        dark: semanticColors.warning.dark,
      },
      error: {
        main: semanticColors.error.main,
        light: semanticColors.error.light,
        dark: semanticColors.error.dark,
      },
      info: {
        main: semanticColors.info.main,
        light: semanticColors.info.light,
        dark: semanticColors.info.dark,
      },
      background: {
        default: colors.bg,
        paper: colors.card,
      },
      text: {
        primary: colors.text,
        secondary: colors.textSecondary,
        disabled: colors.textMuted,
      },
    },
    typography: {
      fontFamily: preset.fontFamily?.sans.join(', ') || '"DM Sans", "Inter", system-ui, sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
          standardSuccess: {
            backgroundColor: isDark 
              ? `${semanticColors.success.main}20` 
              : semanticColors.success.light,
            color: isDark ? colors.text : semanticColors.success.dark,
            '& .MuiAlert-icon': {
              color: semanticColors.success.main,
            },
          },
          standardError: {
            backgroundColor: isDark 
              ? `${semanticColors.error.main}20` 
              : semanticColors.error.light,
            color: isDark ? colors.text : semanticColors.error.dark,
            '& .MuiAlert-icon': {
              color: semanticColors.error.main,
            },
          },
          standardWarning: {
            backgroundColor: isDark 
              ? `${semanticColors.warning.main}20` 
              : semanticColors.warning.light,
            color: isDark ? colors.text : semanticColors.warning.dark,
            '& .MuiAlert-icon': {
              color: semanticColors.warning.main,
            },
          },
          standardInfo: {
            backgroundColor: isDark 
              ? `${semanticColors.info.main}20` 
              : semanticColors.info.light,
            color: isDark ? colors.text : semanticColors.info.dark,
            '& .MuiAlert-icon': {
              color: semanticColors.info.main,
            },
          },
          filledSuccess: {
            backgroundColor: semanticColors.success.main,
          },
          filledError: {
            backgroundColor: semanticColors.error.main,
          },
          filledWarning: {
            backgroundColor: semanticColors.warning.main,
          },
          filledInfo: {
            backgroundColor: semanticColors.info.main,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              backgroundColor: colors.card,
              color: colors.text,
              borderRadius: '12px',
              boxShadow: isDark
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    },
  };

  // Locale ve overrides birleştir
  const themeArgs: [ThemeOptions, ...object[]] = [baseTheme];
  
  if (locale) {
    themeArgs.push(locale);
  }

  const theme = createTheme(...themeArgs);

  // Overrides varsa deep merge yap
  if (overrides) {
    return createTheme(theme, overrides);
  }

  return theme;
}

export default createKerzzTheme;



