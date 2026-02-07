import React, { createContext, useMemo } from 'react';
import type { GridLocale, SupportedLocale } from '../types/locale.types';
import { tr } from './locales/tr';
import { en } from './locales/en';

const localeMap: Record<SupportedLocale, GridLocale> = { tr, en };

export const LocaleContext = createContext<GridLocale>(tr);

export interface LocaleProviderProps {
  locale?: SupportedLocale;
  /** Custom locale overrides */
  customLocale?: Partial<GridLocale>;
  children: React.ReactNode;
}

export function LocaleProvider({
  locale = 'tr',
  customLocale,
  children,
}: LocaleProviderProps) {
  const resolved = useMemo(() => {
    const base = localeMap[locale] ?? tr;
    return customLocale ? { ...base, ...customLocale } : base;
  }, [locale, customLocale]);

  return (
    <LocaleContext.Provider value={resolved}>{children}</LocaleContext.Provider>
  );
}
