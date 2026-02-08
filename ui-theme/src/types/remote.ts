/**
 * Remote Theme Types
 * DB'den gelen tema tipleri
 */

import type { ThemePreset } from '../presets/types';

/**
 * Çoklu dil destekli metin
 */
export interface LocalizedText {
  tr?: string;
  en?: string;
  de?: string;
  fr?: string;
  ru?: string;
  ar?: string;
}

/**
 * Remote tema yapısı (API'den gelen)
 */
export interface RemoteTheme {
  _id: string;
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  colors: ThemePreset['colors'];
  gradients: ThemePreset['gradients'];
  chart: ThemePreset['chart'];
  fontFamily?: ThemePreset['fontFamily'];
  semantic?: ThemePreset['semantic'];
  isDraft: boolean;
  isDefault: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Remote tema'yı ThemePreset'e dönüştür
 */
export function remoteThemeToPreset(
  remote: RemoteTheme,
  lang = 'tr',
): ThemePreset {
  return {
    id: remote.id,
    name: remote.name[lang as keyof LocalizedText] || remote.name.tr || remote.id,
    description:
      remote.description?.[lang as keyof LocalizedText] ||
      remote.description?.tr ||
      '',
    colors: remote.colors,
    gradients: remote.gradients,
    chart: remote.chart,
    fontFamily: remote.fontFamily,
    semantic: remote.semantic,
  };
}

/**
 * Theme Service konfigürasyonu
 */
export interface ThemeServiceConfig {
  /** API base URL */
  baseUrl: string;
  /** Draft temaları dahil et */
  includeDraft?: boolean;
  /** Cache süresi (ms) */
  cacheTTL?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

