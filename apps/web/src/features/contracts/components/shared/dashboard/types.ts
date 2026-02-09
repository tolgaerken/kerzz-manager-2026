export type Currency = "tl" | "usd" | "eur";

export interface CurrencyBreakdown {
  tl: number;
  usd: number;
  eur: number;
}

export interface CurrencyCountBreakdown {
  tl: number;
  usd: number;
  eur: number;
}

export interface TimePeriodStats {
  count: number;
  currencyCounts: CurrencyCountBreakdown;
  currencyTotals: CurrencyBreakdown;
}

export interface MonthlyTrend {
  month: string;
  label: string;
  count: number;
}
