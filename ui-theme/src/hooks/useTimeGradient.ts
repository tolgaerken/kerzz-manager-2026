/**
 * useTimeGradient Hook
 * Aktif tema preset'inin gradient'lerini saat bazlı döndürür
 */

import { useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { createGradientString } from '../tokens/gradients';
import type { GradientDefinition } from '../tokens/types';

export interface TimeGradientResult {
  /** Gradient tanımı */
  gradient: GradientDefinition;
  /** CSS gradient string */
  gradientString: string;
  /** Zaman dilimi: 'morning' | 'afternoon' | 'evening' */
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

/**
 * Saat bazlı gradient hook'u
 * Aktif tema preset'inin gradient'lerini kullanır
 * @param hour - Saat değeri (0-23), varsayılan olarak mevcut saat
 */
export function useTimeGradient(hour?: number): TimeGradientResult {
  const { getActivePreset } = useThemeStore();
  
  const currentHour = hour ?? new Date().getHours();
  const preset = getActivePreset();

  return useMemo(() => {
    // Zaman dilimine göre gradient seç
    let timeOfDay: 'morning' | 'afternoon' | 'evening';
    let gradient: GradientDefinition;

    if (currentHour >= 5 && currentHour < 12) {
      timeOfDay = 'morning';
      gradient = preset.gradients.morning;
    } else if (currentHour >= 12 && currentHour < 18) {
      timeOfDay = 'afternoon';
      gradient = preset.gradients.afternoon;
    } else {
      timeOfDay = 'evening';
      gradient = preset.gradients.evening;
    }

    return {
      gradient,
      gradientString: createGradientString(gradient),
      timeOfDay,
    };
  }, [currentHour, preset]);
}

export default useTimeGradient;

