/**
 * Semantic Renkler
 * Success, warning, error, info gibi semantic renk tanimlari
 */

import type { SemanticColorPalette } from './types';
import { green, amber, red, blue } from './colors';

/**
 * Success renkleri
 */
export const successPalette: SemanticColorPalette = {
  light: green[100],
  main: green[500],
  dark: green[700],
};

/**
 * Warning renkleri
 */
export const warningPalette: SemanticColorPalette = {
  light: amber[100],
  main: amber[500],
  dark: amber[700],
};

/**
 * Error renkleri
 */
export const errorPalette: SemanticColorPalette = {
  light: red[100],
  main: red[500],
  dark: red[700],
};

/**
 * Info renkleri
 */
export const infoPalette: SemanticColorPalette = {
  light: blue[100],
  main: blue[500],
  dark: blue[700],
};

/**
 * Tum semantic renkler
 */
export const semanticColors = {
  success: successPalette,
  warning: warningPalette,
  error: errorPalette,
  info: infoPalette,
};

