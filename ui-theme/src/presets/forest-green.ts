/**
 * Forest Green Theme Preset
 * Dogal, yesil tonlari ile sakin tema
 */

import type { ThemePreset } from './types';
import { slate, emerald, green, lime, teal } from '../tokens/colors';
import type { GradientConfig } from '../tokens/types';

const forestGradients: GradientConfig = {
  morning: {
    colors: [lime[400], green[500], emerald[500]],
    angle: 135,
  },
  afternoon: {
    colors: [green[500], emerald[600], teal[600]],
    angle: 135,
  },
  evening: {
    colors: [emerald[700], teal[800], slate[900]],
    angle: 135,
  },
  primary: {
    colors: [emerald[500], emerald[600]],
    angle: 135,
  },
  dark: {
    colors: ['#0f172a', '#1e293b'],
    angle: 180,
  },
};

export const forestGreenPreset: ThemePreset = {
  id: 'forest-green',
  name: 'theme.presets.forestGreen.name',
  description: 'theme.presets.forestGreen.description',
  colors: {
    primary: emerald,
    dark: {
      bg: '#0a1410',
      card: '#0f1f1a',
      cardElevated: '#162e26',
      border: emerald[900],
      borderLight: emerald[800],
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
    },
    light: {
      bg: emerald[50],
      card: green[50],
      cardElevated: green[100],
      border: emerald[200],
      borderLight: emerald[100],
      text: slate[800],
      textSecondary: slate[600],
      textMuted: slate[400],
    },
  },
  gradients: forestGradients,
  chart: {
    primary: [emerald[500], green[500], teal[500], emerald[600], green[600], teal[600], lime[500], green[400]],
    secondary: [slate[500], slate[400], slate[600]],
    accent: [emerald[700], green[700], teal[700], emerald[800]],
  },
  fontFamily: {
    sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
    display: ['Clash Display', 'DM Sans', 'sans-serif'],
  },
};

