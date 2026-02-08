/**
 * Kerzz Cloud Tailwind CSS Preset
 * Dinamik preset sistemi ile tutarli renk, font ve stil tanimlari
 */

import { getPreset, getSemanticColors, DEFAULT_PRESET_ID } from '../presets';
import { colorPalettes } from '../tokens/colors';

// Legacy export (geriye uyumluluk icin)
export const kerzzColors = {
  primary: {
    50: '#fef3f2',
    100: '#fee4e2',
    200: '#fececa',
    300: '#fcaba4',
    400: '#f87b6f',
    500: '#ef5343',
    600: '#dc3525',
    700: '#b9291b',
    800: '#99261a',
    900: '#7f261c',
    950: '#450f09',
  },
  dark: {
    bg: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
  },
};

export const kerzzFontFamily = {
  sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
  display: ['Clash Display', 'DM Sans', 'sans-serif'],
};

/**
 * Varsayilan Tailwind CSS Preset (geriye uyumluluk icin)
 * Kullanim: presets: [kerzzTailwindPreset]
 */
export const kerzzTailwindPreset = {
  darkMode: 'class' as const,
  theme: {
    extend: {
      colors: kerzzColors,
      fontFamily: kerzzFontFamily,
    },
  },
  plugins: [],
};

/**
 * Dinamik Tailwind CSS Preset olusturucu
 * Preset ID'sine gore Tailwind konfigurasyonu olusturur
 * 
 * @param presetId - Preset ID (opsiyonel, varsayilan: 'kerzz-red')
 * @returns Tailwind CSS preset
 */
export function createKerzzTailwindPreset(presetId?: string) {
  const resolvedPresetId = presetId || DEFAULT_PRESET_ID;
  const preset = getPreset(resolvedPresetId);
  const semanticColors = getSemanticColors(resolvedPresetId);
  
  // colorPalettes'i kopyala ve sky'i override et
  const { sky: _sky, ...otherPalettes } = colorPalettes;
  
  return {
    darkMode: 'class' as const,
    theme: {
      extend: {
        colors: {
          // Primary renkleri preset'ten al
          primary: preset.colors.primary,
          
          // Dark mode renkleri
          dark: preset.colors.dark,
          
          // Light mode renkleri (sky prefix ile, preset'ten override edilir)
          sky: {
            50: preset.colors.light.bg,
            100: preset.colors.light.card,
            150: preset.colors.light.cardElevated,
            200: preset.colors.light.border,
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          
          // Semantic renkler (preset'ten veya varsayilan)
          semantic: {
            success: semanticColors.success,
            warning: semanticColors.warning,
            error: semanticColors.error,
            info: semanticColors.info,
          },
          
          // Tum renk paletleri (semantic, category vb. icin)
          ...otherPalettes,
        },
        fontFamily: preset.fontFamily || kerzzFontFamily,
      },
    },
    plugins: [],
  };
}

export default kerzzTailwindPreset;




