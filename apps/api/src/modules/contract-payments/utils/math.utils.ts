/**
 * Sayiyi 2 ondalik basamaga yuvarlar.
 * NaN veya Infinity degerlerinde 0 dondurur.
 */
export function safeRound(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return parseFloat(value.toFixed(2));
}
