import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Ortak çeviri dosyaları
import { tr, en, de, fr, ru, ar } from './locales';

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export const RTL_LANGUAGES = ['ar'];

export const isRTL = (lang: string): boolean => RTL_LANGUAGES.includes(lang);

/**
 * Tarayıcının sistem dilini algıla
 */
export const getBrowserLanguage = (): string => {
  try {
    const browserLang = navigator.language || navigator.languages?.[0];
    if (!browserLang) return 'en';

    const langCode = browserLang.split('-')[0].toLowerCase();

    if (SUPPORTED_LANGUAGES.some((lang) => lang.code === langCode)) {
      return langCode;
    }
  } catch {
    // Browser API hatası
  }

  return 'en';
};

/**
 * localStorage'dan kaydedilmiş dili oku
 */
export const getStoredLanguage = (storageKey: string): string => {
  try {
    const storedLang = localStorage.getItem(storageKey);
    if (storedLang && SUPPORTED_LANGUAGES.some((lang) => lang.code === storedLang)) {
      return storedLang;
    }
  } catch {
    // localStorage erişim hatası
  }

  return getBrowserLanguage();
};

/**
 * Dili localStorage'a kaydet
 */
export const saveLanguageToStorage = (storageKey: string, lang: string): void => {
  try {
    localStorage.setItem(storageKey, lang);
  } catch {
    // localStorage yazma hatası
  }
};

export interface I18nInitOptions {
  storageKey?: string;
  additionalResources?: Record<string, object>;
}

/**
 * i18n instance oluştur ve yapılandır
 */
export function createI18nInstance(options: I18nInitOptions = {}) {
  const { storageKey = 'kerzz-language', additionalResources = {} } = options;

  // Base resources
  const resources: Record<string, { translation: object }> = {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    ru: { translation: ru },
    ar: { translation: ar },
  };

  // Ek kaynakları birleştir
  Object.entries(additionalResources).forEach(([lang, translations]) => {
    if (resources[lang]) {
      resources[lang].translation = {
        ...resources[lang].translation,
        ...translations,
      };
    } else {
      resources[lang] = { translation: translations as object };
    }
  });

  i18n.use(initReactI18next).init({
    resources,
    lng: getStoredLanguage(storageKey),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  // Dil değişikliğini dinle ve kaydet
  i18n.on('languageChanged', (lng) => {
    saveLanguageToStorage(storageKey, lng);
  });

  return i18n;
}

export { i18n };
export default createI18nInstance;

