/**
 * Token Index
 * Tum token'lari export eden merkezi dosya
 */

// Types
export * from './types';

// Colors
export * from './colors';

// Semantic
export * from './semantic';

// Category
export * from './category';

// Allergen
export * from './allergen';

// Gradients
export * from './gradients';

// Token collection
import { colorPalettes } from './colors';
import { semanticColors } from './semantic';
import { categoryColors } from './category';
import { gradients } from './gradients';
import type { TokenCollection, ChartColors } from './types';

/**
 * Chart renkleri
 */
export const chartColors: ChartColors = {
  primary: [
    '#ef5343', // Kerzz red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
  ],
  secondary: [
    '#64748b', // Slate
    '#94a3b8', // Slate light
    '#cbd5e1', // Slate lighter
  ],
  accent: [
    '#dc2626', // Red dark
    '#2563eb', // Blue dark
    '#059669', // Green dark
    '#d97706', // Amber dark
  ],
};

/**
 * Tum token'larin merkezi koleksiyonu
 */
export const tokens: TokenCollection = {
  colors: colorPalettes,
  semantic: semanticColors,
  category: categoryColors,
  gradients,
  chart: chartColors,
};

