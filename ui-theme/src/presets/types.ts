/**
 * Theme Preset Tip Tanimlari
 */

import type {
  ColorScale,
  DarkModeColors,
  LightModeColors,
  GradientConfig,
  FontConfig,
  ChartColors,
  SemanticColorPalette,
} from '../tokens/types';

/**
 * Tema bazli semantic renkler
 */
export interface ThemeSemanticColors {
  success: SemanticColorPalette;
  warning: SemanticColorPalette;
  error: SemanticColorPalette;
  info: SemanticColorPalette;
}

/**
 * Theme Preset Interface
 * Her preset bu yapida tanimlanir
 */
export interface ThemePreset {
  id: string;
  name: string; // i18n key
  description: string; // i18n key
  colors: {
    primary: ColorScale;
    dark: DarkModeColors;
    light: LightModeColors;
  };
  gradients: GradientConfig;
  chart: ChartColors;
  fontFamily?: FontConfig;
  semantic?: ThemeSemanticColors;
}

/**
 * Preset koleksiyonu
 */
export interface PresetCollection {
  [key: string]: ThemePreset;
}

