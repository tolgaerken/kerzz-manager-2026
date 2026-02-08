/**
 * @kerzz/ui-theme
 * Kerzz Cloud ortak tema, stil ve i18n paketi
 */

// ============================================
// TOKENS
// ============================================
export * from './tokens';

// ============================================
// PRESETS
// ============================================
export * from './presets';

// ============================================
// UTILS
// ============================================
export * from './utils';

// ============================================
// TAILWIND
// ============================================
export {
  kerzzTailwindPreset,
  createKerzzTailwindPreset,
  kerzzColors,
  kerzzFontFamily,
} from './tailwind/preset';

// ============================================
// MUI THEME
// ============================================
export { createKerzzTheme } from './mui/theme';
export type { KerzzThemeOptions } from './mui/theme';

// ============================================
// STORES
// ============================================
export { useThemeStore } from './stores/themeStore';
export type { ThemeState } from './stores/themeStore';

export { useSidebarStore } from './stores/sidebarStore';
export type { SidebarState } from './stores/sidebarStore';

// ============================================
// I18N
// ============================================
export {
  createI18nInstance,
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  isRTL,
  getBrowserLanguage,
  getStoredLanguage,
  saveLanguageToStorage,
  i18n,
} from './i18n/config';
export type { LanguageConfig, I18nInitOptions } from './i18n/config';

// ============================================
// HOOKS
// ============================================
export { useLocale, muiLocaleMap, muiDatePickerLocaleMap } from './hooks/useLocale';
export { useRemoteThemes } from './hooks/useRemoteThemes';
export { useTimeGradient } from './hooks/useTimeGradient';
export type { TimeGradientResult } from './hooks/useTimeGradient';

// ============================================
// REMOTE THEME SERVICE
// ============================================
export {
  configureThemeService,
  isThemeServiceConfigured,
  clearThemeCache,
  fetchThemes,
  fetchThemeById,
  fetchDefaultTheme,
} from './services/themeService';

// ============================================
// REMOTE TYPES
// ============================================
export type {
  RemoteTheme,
  LocalizedText,
  ThemeServiceConfig,
} from './types/remote';
export { remoteThemeToPreset } from './types/remote';

// ============================================
// COMPONENTS
// ============================================
export { Logo } from './components/Logo';
export type { LogoProps } from './components/Logo';

export { LanguageSelector } from './components/LanguageSelector';

export { ThemePresetSelector } from './components/ThemePresetSelector';

export { ThemeSettingsPopover } from './components/ThemeSettingsPopover';
export type { ThemeSettingsPopoverProps } from './components/ThemeSettingsPopover';

export { ThemeInitializer } from './components/ThemeInitializer';
export type { ThemeInitializerProps } from './components/ThemeInitializer';

export { ThemeAwareToaster } from './components/ThemeAwareToaster';
export type { ThemeAwareToasterProps } from './components/ThemeAwareToaster';




