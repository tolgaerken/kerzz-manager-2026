import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import 'dayjs/locale/en';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/ru';
import 'dayjs/locale/ar';

// MUI Locale imports
import { trTR, enUS, deDE, frFR, ruRU, arSA } from '@mui/material/locale';
import { 
  trTR as datePickerTrTR, 
  enUS as datePickerEnUS,
  deDE as datePickerDeDE,
  frFR as datePickerFrFR,
  ruRU as datePickerRuRU,
} from '@mui/x-date-pickers/locales';

/**
 * MUI core locale map
 */
export const muiLocaleMap: Record<string, object> = {
  tr: trTR,
  en: enUS,
  de: deDE,
  fr: frFR,
  ru: ruRU,
  ar: arSA,
};

/**
 * MUI date picker locale map
 */
export const muiDatePickerLocaleMap: Record<string, object> = {
  tr: datePickerTrTR,
  en: datePickerEnUS,
  de: datePickerDeDE,
  fr: datePickerFrFR,
  ru: datePickerRuRU,
  ar: datePickerEnUS, // Arapça için fallback
};

/**
 * useLocale Hook
 * dayjs ve MUI locale senkronizasyonu
 */
export function useLocale() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // dayjs locale ayarla
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    muiLocale: muiLocaleMap[i18n.language] || muiLocaleMap.en,
    muiDatePickerLocale: muiDatePickerLocaleMap[i18n.language] || muiDatePickerLocaleMap.en,
  };
}

export default useLocale;



