/**
 * Alerjen Renkleri
 * Menu item'larda kullanılan alerjen kategorileri için renkler
 */

import type { AllergenColorMapping } from './types';
import { amber, blue, cyan, pink, lime, orange, green, violet, indigo, sky, slate, yellow, emerald } from './colors';

/**
 * Alerjen tipleri
 */
export type AllergenType =
  | 'gluten'
  | 'dairy'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'nuts'
  | 'peanuts'
  | 'soy'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulfites'
  | 'lupin'
  | 'mollusks';

/**
 * Alerjen renk mapping'i
 */
export const allergenColors: Record<AllergenType, AllergenColorMapping> = {
  gluten: {
    main: amber[500],
    light: amber[100],
    dark: amber[700],
  },
  dairy: {
    main: blue[500],
    light: blue[100],
    dark: blue[700],
  },
  eggs: {
    main: yellow[500],
    light: yellow[100],
    dark: yellow[700],
  },
  fish: {
    main: cyan[500],
    light: cyan[100],
    dark: cyan[700],
  },
  shellfish: {
    main: pink[500],
    light: pink[100],
    dark: pink[700],
  },
  nuts: {
    main: lime[500],
    light: lime[100],
    dark: lime[700],
  },
  peanuts: {
    main: orange[500],
    light: orange[100],
    dark: orange[700],
  },
  soy: {
    main: green[500],
    light: green[100],
    dark: green[700],
  },
  celery: {
    main: emerald[500],
    light: emerald[100],
    dark: emerald[700],
  },
  mustard: {
    main: yellow[500],
    light: yellow[100],
    dark: yellow[700],
  },
  sesame: {
    main: slate[400],
    light: slate[100],
    dark: slate[600],
  },
  sulfites: {
    main: violet[500],
    light: violet[100],
    dark: violet[700],
  },
  lupin: {
    main: indigo[500],
    light: indigo[100],
    dark: indigo[700],
  },
  mollusks: {
    main: sky[500],
    light: sky[100],
    dark: sky[700],
  },
};

/**
 * Alerjen ikonları (emoji yerine icon kullanılması önerilir)
 * Bu sadece referans için tutulmaktadır
 */
export const allergenIconNames: Record<AllergenType, string> = {
  gluten: 'grain',
  dairy: 'local_drink',
  eggs: 'egg',
  fish: 'set_meal',
  shellfish: 'restaurant',
  nuts: 'nutrition',
  peanuts: 'nutrition',
  soy: 'eco',
  celery: 'grass',
  mustard: 'circle',
  sesame: 'adjust',
  sulfites: 'wine_bar',
  lupin: 'local_florist',
  mollusks: 'restaurant',
};


