/**
 * Pipeline satır kalemi hesaplama yardımcı fonksiyonları.
 * Ürün, lisans ve kiralama kalemleri için ortak hesaplama mantığı.
 */

interface LineItemFields {
  qty: number;
  price: number;
  vatRate: number;
  discountRate: number;
}

interface RentalLineItemFields extends LineItemFields {
  rentPeriod: number;
}

interface CalculatedFields {
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

/**
 * Tek bir satır kalemi için ara toplam, indirim, KDV ve genel toplamı hesaplar.
 */
export function calculateLineItem(item: LineItemFields): CalculatedFields {
  const qty = item.qty || 0;
  const price = item.price || 0;
  const vatRate = item.vatRate || 0;
  const discountRate = item.discountRate || 0;

  const subTotal = qty * price;
  const discountTotal = subTotal * (discountRate / 100);
  const afterDiscount = subTotal - discountTotal;
  const taxTotal = afterDiscount * (vatRate / 100);
  const grandTotal = afterDiscount + taxTotal;

  return {
    subTotal: round2(subTotal),
    discountTotal: round2(discountTotal),
    taxTotal: round2(taxTotal),
    grandTotal: round2(grandTotal),
  };
}

/**
 * Kiralama kalemi icin ara toplam, indirim, KDV ve genel toplamı hesaplar.
 * (Aylık fiyat * süre) üzerinden hesaplama yapar.
 */
export function calculateRentalItem(item: RentalLineItemFields): CalculatedFields {
  const qty = item.qty || 0;
  const price = item.price || 0;
  const rentPeriod = item.rentPeriod || 1;
  const vatRate = item.vatRate || 0;
  const discountRate = item.discountRate || 0;

  const subTotal = qty * price * rentPeriod;
  const discountTotal = subTotal * (discountRate / 100);
  const afterDiscount = subTotal - discountTotal;
  const taxTotal = afterDiscount * (vatRate / 100);
  const grandTotal = afterDiscount + taxTotal;

  return {
    subTotal: round2(subTotal),
    discountTotal: round2(discountTotal),
    taxTotal: round2(taxTotal),
    grandTotal: round2(grandTotal),
  };
}

/**
 * Bir satır kalemini hesaplanmış alanlarla günceller.
 */
export function recalculateItem<T extends LineItemFields & Partial<CalculatedFields>>(
  item: T,
): T {
  const calc = calculateLineItem(item);
  return { ...item, ...calc };
}

/**
 * Kiralama kalemini hesaplanmış alanlarla günceller.
 */
export function recalculateRentalItem<
  T extends RentalLineItemFields & Partial<CalculatedFields>,
>(item: T): T {
  const calc = calculateRentalItem(item);
  return { ...item, ...calc };
}

/**
 * 2 ondalık basamağa yuvarlar.
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  tl: "₺",
  usd: "$",
  eur: "€",
};

/**
 * Tutarı para birimi sembolü ile formatlar.
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency?.toLowerCase()] || currency?.toUpperCase() || "";
  return `${symbol} ${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Geçici ID üretir (local state'de yeni eklenen kalemler için).
 */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
