/**
 * ThemeInitializer Component
 * Remote temaları yükleyen ve store'a kaydeden component
 * Uygulama başlangıcında render edilmeli
 */

import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import {
  configureThemeService,
  fetchThemes,
  isThemeServiceConfigured,
} from '../services/themeService';
import type { ThemeServiceConfig } from '../types/remote';

export interface ThemeInitializerProps {
  /** Theme API base URL (örn: 'https://api.kerzz.com/api') */
  apiBaseUrl: string;
  /** Draft temaları dahil et (varsayılan: false - müşteri portalları için) */
  includeDraft?: boolean;
  /** Cache süresi ms (varsayılan: 5 dakika) */
  cacheTTL?: number;
  /** Dil (localized text için) */
  language?: string;
  /** Children */
  children?: React.ReactNode;
}

/**
 * Remote temaları yükleyen ve store'a kaydeden component.
 * 
 * Kullanım:
 * ```tsx
 * <ThemeInitializer 
 *   apiBaseUrl="https://api.kerzz.com/api"
 *   language={i18n.language}
 * >
 *   <App />
 * </ThemeInitializer>
 * ```
 */
export function ThemeInitializer({
  apiBaseUrl,
  includeDraft = false,
  cacheTTL,
  language = 'tr',
  children,
}: ThemeInitializerProps) {
  const { setRemoteThemes, setRemotesLoading, setLanguage } = useThemeStore();

  // Service'i yapılandır ve temaları yükle
  useEffect(() => {
    const config: ThemeServiceConfig = {
      baseUrl: apiBaseUrl,
      includeDraft,
      cacheTTL,
    };

    // Service'i yapılandır
    if (!isThemeServiceConfigured()) {
      configureThemeService(config);
    }

    // Temaları yükle
    const loadThemes = async () => {
      setRemotesLoading(true);
      try {
        const themes = await fetchThemes();
        setRemoteThemes(themes);
      } catch (error) {
        console.error('[ThemeInitializer] Temalar yüklenemedi:', error);
        setRemoteThemes([]);
      }
    };

    loadThemes();
  }, [apiBaseUrl, includeDraft, cacheTTL, setRemoteThemes, setRemotesLoading]);

  // Dil değişikliğini store'a kaydet
  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  return <>{children}</>;
}

export default ThemeInitializer;

