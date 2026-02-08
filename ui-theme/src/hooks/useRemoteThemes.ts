/**
 * useRemoteThemes Hook
 * Remote temalarını yönetmek için React hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { RemoteTheme } from '../types/remote';
import {
  fetchThemes,
  isThemeServiceConfigured,
  clearThemeCache,
} from '../services/themeService';

interface UseRemoteThemesOptions {
  /** Otomatik yükle (varsayılan: true) */
  autoFetch?: boolean;
}

interface UseRemoteThemesReturn {
  /** Tema listesi */
  themes: RemoteTheme[];
  /** Yükleniyor durumu */
  loading: boolean;
  /** Hata mesajı */
  error: string | null;
  /** Temaları yeniden yükle */
  refetch: () => Promise<void>;
  /** Cache'i temizle ve yeniden yükle */
  refresh: () => Promise<void>;
}

/**
 * Remote temaları çeken ve yöneten hook
 */
export function useRemoteThemes(
  options: UseRemoteThemesOptions = {},
): UseRemoteThemesReturn {
  const { autoFetch = true } = options;

  const [themes, setThemes] = useState<RemoteTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isThemeServiceConfigured()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchThemes();
      setThemes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Temalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    clearThemeCache();
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    themes,
    loading,
    error,
    refetch: fetchData,
    refresh,
  };
}

export default useRemoteThemes;

