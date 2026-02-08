/**
 * Sunset Orange Theme Preset
 * Sicak, enerji dolu turuncu tonlari
 */

import type { ThemePreset } from './types';
import { slate, orange, amber, red, yellow } from '../tokens/colors';
import type { GradientConfig } from '../tokens/types';

const sunsetGradients: GradientConfig = {
  morning: {
    colors: [yellow[400], amber[500], orange[500]],
    angle: 135,
  },
  afternoon: {
    colors: [orange[500], orange[600], red[500]],
    angle: 135,
  },
  evening: {
    colors: [orange[600], red[600], red[700]],
    angle: 135,
  },
  primary: {
    colors: [orange[500], orange[600]],
    angle: 135,
  },
  dark: {
    colors: ['#0f172a', '#1e293b'],
    angle: 180,
  },
};

export const sunsetOrangePreset: ThemePreset = {
  id: 'sunset-orange',
  name: 'theme.presets.sunsetOrange.name',
  description: 'theme.presets.sunsetOrange.description',
  colors: {
    primary: orange,
    dark: {
      bg: '#1a0f0a',
      card: '#261810',
      cardElevated: '#33221a',
      border: orange[900],
      borderLight: orange[800],
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
    },
    light: {
      bg: orange[50],
      card: amber[50],
      cardElevated: amber[100],
      border: orange[200],
      borderLight: orange[100],
      text: slate[800],
      textSecondary: slate[600],
      textMuted: slate[400],
    },
  },
  gradients: sunsetGradients,
  chart: {
    primary: [orange[500], amber[500], red[500], orange[600], amber[600], red[600], yellow[500], orange[400]],
    secondary: [slate[500], slate[400], slate[600]],
    accent: [orange[700], amber[700], red[700], orange[800]],
  },
  fontFamily: {
    sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
    display: ['Clash Display', 'DM Sans', 'sans-serif'],
  },
};

