const CURRENCY_MAP: Record<string, string> = {
  tl: "TRY",
  usd: "USD",
  eur: "EUR",
};

export const CURRENCY_LABELS: Record<string, string> = {
  tl: "TL",
  usd: "USD",
  eur: "EUR",
};

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: CURRENCY_MAP[currency] || "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}
