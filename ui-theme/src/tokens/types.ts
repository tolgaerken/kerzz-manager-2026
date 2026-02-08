/**
 * Token Tip Tanimlari
 * Semantic token sistemi icin temel tipler
 */

/**
 * Renk tonlari (50-950)
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Kategori renk yapisi
 */
export interface CategoryColorScheme {
  bg: string;
  border: string;
  text: string;
}

/**
 * Dark mode renkleri
 */
export interface DarkModeColors {
  bg: string;
  card: string;
  cardElevated: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
}

/**
 * Light mode renkleri
 */
export interface LightModeColors {
  bg: string;
  card: string;
  cardElevated: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
}

/**
 * Semantic renkler
 */
export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Semantic renk paletleri
 */
export interface SemanticColorPalette {
  light: string;
  main: string;
  dark: string;
}

/**
 * Alerjen renk mapping'i
 */
export interface AllergenColorMapping {
  main: string;
  light: string;
  dark: string;
}

/**
 * Payment kategori renkleri
 */
export type PaymentCategory = 'cash' | 'credit_card' | 'debit_card' | 'meal_voucher' | 'voucher' | 'mobile' | 'other';

/**
 * Status kategori renkleri
 */
export type StatusCategory = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

/**
 * Delivery status renkleri
 */
export type DeliveryStatus = 'preparing' | 'ready' | 'on_delivery' | 'delivered';

/**
 * Kategori renk mapping'i
 */
export interface CategoryColorMapping {
  light: CategoryColorScheme;
  dark: CategoryColorScheme;
}

/**
 * Gradient tanımı
 */
export interface GradientDefinition {
  colors: string[];
  angle?: number; // derece (varsayilan 135)
}

/**
 * Gradient koleksiyonu
 */
export interface GradientConfig {
  morning: GradientDefinition;
  afternoon: GradientDefinition;
  evening: GradientDefinition;
  primary: GradientDefinition;
  dark: GradientDefinition;
}

/**
 * Font konfigürasyonu
 */
export interface FontConfig {
  sans: string[];
  display: string[];
}

/**
 * Chart renkleri
 */
export interface ChartColors {
  primary: string[];
  secondary: string[];
  accent: string[];
}

/**
 * Token koleksiyonu
 */
export interface TokenCollection {
  colors: {
    // Temel renk paletleri
    slate: ColorScale;
    red: ColorScale;
    orange: ColorScale;
    amber: ColorScale;
    yellow: ColorScale;
    lime: ColorScale;
    green: ColorScale;
    emerald: ColorScale;
    teal: ColorScale;
    cyan: ColorScale;
    sky: ColorScale;
    blue: ColorScale;
    indigo: ColorScale;
    violet: ColorScale;
    purple: ColorScale;
    fuchsia: ColorScale;
    pink: ColorScale;
    rose: ColorScale;
  };
  semantic: {
    success: SemanticColorPalette;
    warning: SemanticColorPalette;
    error: SemanticColorPalette;
    info: SemanticColorPalette;
  };
  category: {
    payment: Record<PaymentCategory, CategoryColorMapping>;
    status: Record<StatusCategory, CategoryColorMapping>;
    delivery: Record<DeliveryStatus, CategoryColorMapping>;
  };
  gradients: GradientConfig;
  chart: ChartColors;
}

