/**
 * Ocean Blue Theme Preset
 * Mavi tonlari ile sakin, profesyonel tema
 */

import type { ThemePreset } from './types';
import { slate, sky, blue, cyan } from '../tokens/colors';
import type { GradientConfig } from '../tokens/types';

const oceanGradients: GradientConfig = {
  morning: {
    colors: [cyan[400], blue[500], blue[600]],
    angle: 135,
  },
  afternoon: {
    colors: [blue[500], blue[600], blue[700]],
    angle: 135,
  },
  evening: {
    colors: [blue[700], blue[800], slate[900]],
    angle: 135,
  },
  primary: {
    colors: [blue[500], blue[600]],
    angle: 135,
  },
  dark: {
    colors: ['#0f172a', '#1e293b'],
    angle: 180,
  },
};

export const oceanBluePreset: ThemePreset = {
  id: 'ocean-blue',
  name: 'theme.presets.oceanBlue.name',
  description: 'theme.presets.oceanBlue.description',
  colors: {
    primary: blue,
    dark: {
      bg: '#0a1628',
      card: '#0f1d32',
      cardElevated: '#162844',
      border: blue[900],
      borderLight: blue[800],
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
    },
    light: {
      bg: cyan[50],
      card: blue[50],
      cardElevated: blue[100],
      border: blue[200],
      borderLight: blue[100],
      text: slate[800],
      textSecondary: slate[600],
      textMuted: slate[400],
    },
  },
  gradients: oceanGradients,
  chart: {
    primary: [blue[500], cyan[500], sky[500], blue[600], cyan[600], sky[600], blue[400], cyan[400]],
    secondary: [slate[500], slate[400], slate[600]],
    accent: [blue[700], cyan[700], sky[700], blue[800]],
  },
  fontFamily: {
    sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
    display: ['Clash Display', 'DM Sans', 'sans-serif'],
  },
};

