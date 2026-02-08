/**
 * Anthracite Gray Theme Preset
 * Sade ve minimalist antrasit gri tonlari
 */

import type { ThemePreset, ThemeSemanticColors } from './types';
import { anthracite } from '../tokens/colors';
import type { GradientConfig } from '../tokens/types';

/**
 * Grayscale semantic renkler
 * Siyah ve beyaz tonlarinda semantic renk paleti
 */
const anthraciteSemanticColors: ThemeSemanticColors = {
  success: {
    light: anthracite[100], // #e8e8e8
    main: anthracite[500],  // #6d6d6d
    dark: anthracite[800],  // #333333
  },
  warning: {
    light: anthracite[200], // #d1d1d1
    main: anthracite[600],  // #5a5a5a
    dark: anthracite[900],  // #242424
  },
  error: {
    light: anthracite[300], // #b0b0b0
    main: anthracite[700],  // #454545
    dark: anthracite[950],  // #171717
  },
  info: {
    light: anthracite[50],  // #f5f5f5
    main: anthracite[400],  // #888888
    dark: anthracite[700],  // #454545
  },
};

const anthraciteGradients: GradientConfig = {
  morning: {
    colors: [anthracite[300], anthracite[400], anthracite[500]],
    angle: 135,
  },
  afternoon: {
    colors: [anthracite[400], anthracite[500], anthracite[600]],
    angle: 135,
  },
  evening: {
    colors: [anthracite[600], anthracite[700], anthracite[800]],
    angle: 135,
  },
  primary: {
    colors: [anthracite[500], anthracite[600]],
    angle: 135,
  },
  dark: {
    colors: [anthracite[900], anthracite[950]],
    angle: 180,
  },
};

export const anthraciteGrayPreset: ThemePreset = {
  id: 'anthracite-gray',
  name: 'theme.presets.anthraciteGray.name',
  description: 'theme.presets.anthraciteGray.description',
  colors: {
    primary: anthracite,
    dark: {
      bg: '#121212',
      card: '#1e1e1e',
      cardElevated: '#2a2a2a',
      border: anthracite[800],
      borderLight: anthracite[700],
      text: '#f5f5f5',
      textSecondary: '#b0b0b0',
      textMuted: '#888888',
    },
    light: {
      bg: '#f5f5f5',
      card: '#ffffff',
      cardElevated: '#fafafa',
      border: '#e0e0e0',
      borderLight: '#eeeeee',
      text: '#1a1a1a',
      textSecondary: '#666666',
      textMuted: '#999999',
    },
  },
  gradients: anthraciteGradients,
  chart: {
    primary: [
      anthracite[500],
      anthracite[400],
      anthracite[600],
      anthracite[300],
      anthracite[700],
      anthracite[200],
      anthracite[800],
      anthracite[100],
    ],
    secondary: [anthracite[400], anthracite[500], anthracite[600]],
    accent: [anthracite[600], anthracite[700], anthracite[800], anthracite[900]],
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },
  semantic: anthraciteSemanticColors,
};


