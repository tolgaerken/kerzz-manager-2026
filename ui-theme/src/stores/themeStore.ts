import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPreset, DEFAULT_PRESET_ID, presets } from '../presets';
import type { ThemePreset } from '../presets/types';
import type { RemoteTheme } from '../types/remote';
import { remoteThemeToPreset } from '../types/remote';

export interface ThemeState {
  isDark: boolean;
  activePresetId: string;
  /** Remote temalar (DB'den) */
  remoteThemes: RemoteTheme[];
  /** Remote temalar yükleniyor mu */
  remotesLoading: boolean;
  /** Seçili dil (localized text için) */
  language: string;
  toggleTheme: () => void;
  setDark: (isDark: boolean) => void;
  setPreset: (presetId: string) => void;
  setLanguage: (lang: string) => void;
  /** Remote temaları güncelle */
  setRemoteThemes: (themes: RemoteTheme[]) => void;
  setRemotesLoading: (loading: boolean) => void;
  getActivePreset: () => ThemePreset;
  getActiveColors: () => ThemePreset['colors'];
  /** Tüm preset listesi (local + remote) */
  getAllPresets: () => ThemePreset[];
}

/**
 * Remote veya local preset'i getir
 */
function getPresetFromStore(
  presetId: string,
  remoteThemes: RemoteTheme[],
  language: string,
): ThemePreset {
  // Önce remote'da ara
  const remoteTheme = remoteThemes.find((t) => t.id === presetId);
  if (remoteTheme) {
    return remoteThemeToPreset(remoteTheme, language);
  }
  // Local preset'lere bak
  return getPreset(presetId);
}

/**
 * Kerzz Cloud Theme Store
 * Dark/Light mode ve preset yönetimi
 * Remote tema desteği ile
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true, // Varsayılan olarak dark mode
      activePresetId: DEFAULT_PRESET_ID,
      remoteThemes: [],
      remotesLoading: false,
      language: 'tr',

      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

      setDark: (isDark: boolean) => set({ isDark }),

      setLanguage: (language: string) => set({ language }),

      setPreset: (presetId: string) => {
        const state = get();
        const preset = getPresetFromStore(
          presetId,
          state.remoteThemes,
          state.language,
        );
        if (preset) {
          set({ activePresetId: preset.id });
        }
      },

      setRemoteThemes: (remoteThemes: RemoteTheme[]) =>
        set({ remoteThemes, remotesLoading: false }),

      setRemotesLoading: (remotesLoading: boolean) => set({ remotesLoading }),

      getActivePreset: () => {
        const state = get();
        return getPresetFromStore(
          state.activePresetId,
          state.remoteThemes,
          state.language,
        );
      },

      getActiveColors: () => {
        const state = get();
        const preset = getPresetFromStore(
          state.activePresetId,
          state.remoteThemes,
          state.language,
        );
        return preset.colors;
      },

      getAllPresets: () => {
        const state = get();
        // Remote temaları önce, sonra local preset'ler
        const remotePresets = state.remoteThemes.map((t) =>
          remoteThemeToPreset(t, state.language),
        );
        // Local preset'leri ekle (remote'da olmayanlar)
        const remoteIds = new Set(remotePresets.map((p) => p.id));
        const localPresets = Object.values(presets).filter(
          (p) => !remoteIds.has(p.id),
        );
        return [...remotePresets, ...localPresets];
      },
    }),
    {
      name: 'kerzz-theme-storage',
      // Remote themes persist edilmemeli - her seferinde yüklenecek
      partialize: (state) => ({
        isDark: state.isDark,
        activePresetId: state.activePresetId,
        language: state.language,
      }),
    },
  ),
);

export default useThemeStore;



