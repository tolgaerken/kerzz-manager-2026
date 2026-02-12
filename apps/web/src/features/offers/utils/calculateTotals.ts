import type {
  PipelineProduct,
  PipelineLicense,
  PipelineRental,
  PipelinePayment,
} from "../../pipeline";

/**
 * Para birimi kodunu ISO 4217 standardına normalize eder
 * "tl", "TL" -> "TRY"
 * "usd", "Usd" -> "USD"
 * "eur", "Eur" -> "EUR"
 */
function normalizeCurrency(currency: string | undefined | null): string {
  if (!currency) return "TRY";
  const upper = currency.toUpperCase().trim();
  if (upper === "TL") return "TRY";
  if (upper === "DOLAR" || upper === "DOLLAR") return "USD";
  if (upper === "EURO") return "EUR";
  return upper;
}

export interface CurrencyTotal {
  currency: string;
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export interface OfferTotalsResult {
  byCurrency: CurrencyTotal[];
  overall: {
    subTotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
  };
  payments: {
    byCurrency: { currency: string; total: number }[];
    overall: number;
  };
}

type ItemWithTotals = Partial<
  Pick<
    PipelineProduct | PipelineLicense | PipelineRental,
    | "currency"
    | "subTotal"
    | "discountTotal"
    | "taxTotal"
    | "grandTotal"
    | "qty"
    | "price"
    | "discountRate"
    | "vatRate"
  >
> & {
  saleCurrency?: string;
};

/**
 * Teklif kalemlerinden kur bazında ve genel toplamları hesaplar
 */
export function calculateOfferTotals(
  products: ItemWithTotals[] = [],
  licenses: ItemWithTotals[] = [],
  rentals: ItemWithTotals[] = [],
  payments: Partial<PipelinePayment>[] = [],
  usdRate: number = 0,
  eurRate: number = 0
): OfferTotalsResult {
  // Tüm kalemleri birleştir
  const allItems = [...products, ...licenses, ...rentals];

  // Kur bazında grupla
  const currencyMap = new Map<string, CurrencyTotal>();

  for (const item of allItems) {
    // currency veya saleCurrency kullan
    const currency = normalizeCurrency(item.saleCurrency || item.currency);
    
    // Kalem toplamlarını hesapla (eğer yoksa veya 0 ise)
    const qty = item.qty || 0;
    const price = item.price || 0;
    const discountRate = item.discountRate || 0;
    const vatRate = item.vatRate || 0;

    // Önce mevcut değerleri kontrol et, yoksa hesapla
    const lineSubTotal = (item.subTotal && item.subTotal > 0) ? item.subTotal : qty * price;
    const lineDiscountTotal = (item.discountTotal && item.discountTotal > 0) 
      ? item.discountTotal 
      : lineSubTotal * (discountRate / 100);
    const afterDiscount = lineSubTotal - lineDiscountTotal;
    const lineTaxTotal = (item.taxTotal && item.taxTotal > 0) 
      ? item.taxTotal 
      : afterDiscount * (vatRate / 100);
    const lineGrandTotal = (item.grandTotal && item.grandTotal > 0) 
      ? item.grandTotal 
      : afterDiscount + lineTaxTotal;

    if (!currencyMap.has(currency)) {
      currencyMap.set(currency, {
        currency,
        subTotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
      });
    }

    const curr = currencyMap.get(currency)!;
    curr.subTotal += lineSubTotal;
    curr.discountTotal += lineDiscountTotal;
    curr.taxTotal += lineTaxTotal;
    curr.grandTotal += lineGrandTotal;
  }

  // Ödemeleri kur bazında grupla
  const paymentCurrencyMap = new Map<string, number>();
  for (const payment of payments) {
    const currency = normalizeCurrency(payment.currency);
    const amount = payment.amount || 0;
    paymentCurrencyMap.set(
      currency,
      (paymentCurrencyMap.get(currency) || 0) + amount
    );
  }

  // TRY'ye çevirerek genel toplam hesapla
  const byCurrency = Array.from(currencyMap.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency)
  );

  const getRate = (currency: string): number => {
    if (currency === "USD") return usdRate || 1;
    if (currency === "EUR") return eurRate || 1;
    return 1; // TRY
  };

  const overall = {
    subTotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: 0,
  };

  for (const curr of byCurrency) {
    const rate = getRate(curr.currency);
    overall.subTotal += curr.subTotal * rate;
    overall.discountTotal += curr.discountTotal * rate;
    overall.taxTotal += curr.taxTotal * rate;
    overall.grandTotal += curr.grandTotal * rate;
  }

  // Ödeme toplamları
  const paymentsByCurrency = Array.from(paymentCurrencyMap.entries())
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  let paymentsOverall = 0;
  for (const p of paymentsByCurrency) {
    paymentsOverall += p.total * getRate(p.currency);
  }

  return {
    byCurrency,
    overall,
    payments: {
      byCurrency: paymentsByCurrency,
      overall: paymentsOverall,
    },
  };
}

/**
 * Sayıyı para formatına çevirir
 */
export function formatCurrency(value: number, currency: string = "TRY"): string {
  const normalizedCurrency = normalizeCurrency(currency);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
