/**
 * Renk Utility Fonksiyonlari
 * Kategori renkleri, gradient'ler vb. icin yardimci fonksiyonlar
 */

import { paymentCategoryColors, statusCategoryColors, deliveryStatusColors } from '../tokens/category';
import { getTimeGradient, createGradientString } from '../tokens/gradients';
import type { CategoryColorScheme, PaymentCategory, StatusCategory, DeliveryStatus } from '../tokens/types';

// Re-export gradient utilities for convenience
export { getTimeGradient, createGradientString as createGradient } from '../tokens/gradients';

/**
 * Payment kategori rengini al
 */
export function getPaymentCategoryColor(
  category: PaymentCategory,
  mode: 'light' | 'dark'
): CategoryColorScheme {
  return paymentCategoryColors[category]?.[mode] || paymentCategoryColors.other[mode];
}

/**
 * Status kategori rengini al
 */
export function getStatusCategoryColor(
  status: StatusCategory,
  mode: 'light' | 'dark'
): CategoryColorScheme {
  return statusCategoryColors[status]?.[mode] || statusCategoryColors.pending[mode];
}

/**
 * Delivery status rengini al
 */
export function getDeliveryCategoryColor(
  status: DeliveryStatus,
  mode: 'light' | 'dark'
): CategoryColorScheme {
  return deliveryStatusColors[status]?.[mode] || deliveryStatusColors.preparing[mode];
}

/**
 * Saat bazinda gradient CSS string'i al (convenience function)
 */
export function getTimeGradientString(hour: number): string {
  const gradient = getTimeGradient(hour);
  return createGradientString(gradient);
}

/**
 * RGB'den rgba olustur
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

