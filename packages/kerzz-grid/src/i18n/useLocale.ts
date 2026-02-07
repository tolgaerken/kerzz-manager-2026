import { useContext } from 'react';
import { LocaleContext } from './LocaleProvider';
import type { GridLocale, LocaleKey } from '../types/locale.types';

export function useLocale(): GridLocale {
  return useContext(LocaleContext);
}

export function useTranslation(): (key: LocaleKey) => string {
  const locale = useLocale();
  return (key: LocaleKey) => locale[key];
}
