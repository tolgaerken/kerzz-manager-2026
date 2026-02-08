/**
 * Remote Theme Service
 * Backend'den tema verilerini çekmek için
 */

import type {
  RemoteTheme,
  ThemeServiceConfig,
  ApiResponse,
} from '../types/remote';

// Varsayılan cache süresi: 5 dakika
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// Cache yapısı
interface ThemeCache {
  themes: RemoteTheme[];
  timestamp: number;
  ttl: number;
}

let cache: ThemeCache | null = null;
let serviceConfig: ThemeServiceConfig | null = null;

/**
 * Theme Service'i yapılandır
 * Bu fonksiyon uygulama başlangıcında çağrılmalı
 */
export function configureThemeService(config: ThemeServiceConfig): void {
  serviceConfig = {
    ...config,
    cacheTTL: config.cacheTTL ?? DEFAULT_CACHE_TTL,
  };
  // Config değiştiğinde cache'i temizle
  cache = null;
}

/**
 * Service yapılandırıldı mı kontrol et
 */
export function isThemeServiceConfigured(): boolean {
  return serviceConfig !== null;
}

/**
 * Cache geçerli mi kontrol et
 */
function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < cache.ttl;
}

/**
 * Cache'i temizle
 */
export function clearThemeCache(): void {
  cache = null;
}

/**
 * Tüm temaları getir
 */
export async function fetchThemes(): Promise<RemoteTheme[]> {
  // Service yapılandırılmadıysa boş döndür
  if (!serviceConfig) {
    console.warn('[ThemeService] Service yapılandırılmadı. configureThemeService() çağırın.');
    return [];
  }

  // Cache geçerliyse cache'den döndür
  if (isCacheValid() && cache) {
    return cache.themes;
  }

  try {
    const url = new URL(`${serviceConfig.baseUrl}/themes`);
    if (!serviceConfig.includeDraft) {
      url.searchParams.append('includeDraft', 'false');
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: ApiResponse<RemoteTheme[]> = await response.json();

    // Cache'e kaydet
    cache = {
      themes: result.data,
      timestamp: Date.now(),
      ttl: serviceConfig.cacheTTL ?? DEFAULT_CACHE_TTL,
    };

    return result.data;
  } catch (error) {
    console.error('[ThemeService] Temalar yüklenemedi:', error);
    // Cache varsa eski veriyi döndür
    if (cache) {
      return cache.themes;
    }
    return [];
  }
}

/**
 * Tek tema getir
 */
export async function fetchThemeById(id: string): Promise<RemoteTheme | null> {
  if (!serviceConfig) {
    console.warn('[ThemeService] Service yapılandırılmadı.');
    return null;
  }

  try {
    const response = await fetch(`${serviceConfig.baseUrl}/themes/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const result: ApiResponse<RemoteTheme> = await response.json();
    return result.data;
  } catch (error) {
    console.error(`[ThemeService] Tema yüklenemedi (${id}):`, error);
    return null;
  }
}

/**
 * Varsayılan temayı getir
 */
export async function fetchDefaultTheme(): Promise<RemoteTheme | null> {
  if (!serviceConfig) {
    return null;
  }

  try {
    const response = await fetch(`${serviceConfig.baseUrl}/themes/default`);

    if (!response.ok) {
      return null;
    }

    const result: ApiResponse<RemoteTheme | null> = await response.json();
    return result.data;
  } catch (error) {
    console.error('[ThemeService] Varsayılan tema yüklenemedi:', error);
    return null;
  }
}

