/**
 * Gradient Tanimlari
 * Zaman bazli ve genel gradient'ler
 */

import type { GradientDefinition, GradientConfig } from './types';
import { amber, orange, red, indigo, violet, purple } from './colors';

/**
 * Sabah gradient'i (05:00-12:00)
 */
export const morningGradient: GradientDefinition = {
  colors: [amber[400], orange[500], orange[600]],
  angle: 135,
};

/**
 * Oglen gradient'i (12:00-18:00)
 */
export const afternoonGradient: GradientDefinition = {
  colors: [orange[500], red[500], red[600]],
  angle: 135,
};

/**
 * Aksam gradient'i (18:00-05:00)
 */
export const eveningGradient: GradientDefinition = {
  colors: [indigo[500], violet[500], purple[500]],
  angle: 135,
};

/**
 * Primary gradient (Kerzz brand)
 */
export const primaryGradient: GradientDefinition = {
  colors: ['#ef5343', '#dc3525'],
  angle: 135,
};

/**
 * Dark gradient
 */
export const darkGradient: GradientDefinition = {
  colors: ['#0f172a', '#1e293b'],
  angle: 180,
};

/**
 * Tum gradient'ler
 */
export const gradients: GradientConfig = {
  morning: morningGradient,
  afternoon: afternoonGradient,
  evening: eveningGradient,
  primary: primaryGradient,
  dark: darkGradient,
};

/**
 * Gradient CSS string olusturma utility
 */
export function createGradientString(gradient: GradientDefinition): string {
  const angle = gradient.angle ?? 135;
  return `linear-gradient(${angle}deg, ${gradient.colors.join(', ')})`;
}

/**
 * Saat bazinda gradient alma
 */
export function getTimeGradient(hour: number): GradientDefinition {
  if (hour >= 5 && hour < 12) return morningGradient;
  if (hour >= 12 && hour < 18) return afternoonGradient;
  return eveningGradient;
}

