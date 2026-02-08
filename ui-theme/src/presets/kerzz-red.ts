/**
 * Kerzz Red Theme Preset (Varsayilan)
 * Mevcut brand renkleri
 */

import type { ThemePreset } from './types';
import { slate } from '../tokens/colors';
import { gradients, chartColors } from '../tokens';

export const kerzzRedPreset: ThemePreset = {
  id: 'kerzz-red',
  name: 'theme.presets.kerzzRed.name',
  description: 'theme.presets.kerzzRed.description',
  colors: {
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
      cardElevated: '#334155',
      border: '#334155',
      borderLight: '#475569',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
    },
    light: {
      bg: slate[50],
      card: slate[100],
      cardElevated: slate[200],
      border: slate[200],
      borderLight: slate[100],
      text: slate[800],
      textSecondary: slate[600],
      textMuted: slate[400],
    },
  },
  gradients,
  chart: chartColors,
  fontFamily: {
    sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
    display: ['Clash Display', 'DM Sans', 'sans-serif'],
  },
};

