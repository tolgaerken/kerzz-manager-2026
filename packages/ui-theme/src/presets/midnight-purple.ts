/**
 * Midnight Purple Theme Preset
 * Gizeml, lux mor tonlari
 */

import type { ThemePreset } from './types';
import { slate, purple, violet, indigo, fuchsia } from '../tokens/colors';
import type { GradientConfig } from '../tokens/types';

const midnightGradients: GradientConfig = {
  morning: {
    colors: [violet[400], purple[500], fuchsia[500]],
    angle: 135,
  },
  afternoon: {
    colors: [purple[500], violet[600], indigo[600]],
    angle: 135,
  },
  evening: {
    colors: [indigo[600], violet[700], purple[800]],
    angle: 135,
  },
  primary: {
    colors: [purple[500], violet[600]],
    angle: 135,
  },
  dark: {
    colors: ['#0f172a', '#1e293b'],
    angle: 180,
  },
};

export const midnightPurplePreset: ThemePreset = {
  id: 'midnight-purple',
  name: 'theme.presets.midnightPurple.name',
  description: 'theme.presets.midnightPurple.description',
  colors: {
    primary: purple,
    dark: {
      bg: '#0a0514',
      card: '#1a1026',
      cardElevated: '#261838',
      border: purple[900],
      borderLight: purple[800],
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
    },
    light: {
      bg: purple[50],
      card: violet[50],
      cardElevated: violet[100],
      border: purple[200],
      borderLight: purple[100],
      text: slate[800],
      textSecondary: slate[600],
      textMuted: slate[400],
    },
  },
  gradients: midnightGradients,
  chart: {
    primary: [purple[500], violet[500], indigo[500], purple[600], violet[600], indigo[600], fuchsia[500], purple[400]],
    secondary: [slate[500], slate[400], slate[600]],
    accent: [purple[700], violet[700], indigo[700], purple[800]],
  },
  fontFamily: {
    sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
    display: ['Clash Display', 'DM Sans', 'sans-serif'],
  },
};

