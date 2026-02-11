// ─── Backend'den Dönen API Response Tipleri ────────────────

/**
 * Backend'den dönen Currency Breakdown DTO
 */
export interface CurrencyBreakdownDto {
  tl: number;
  usd: number;
  eur: number;
}

/**
 * Backend'den dönen Currency Count Breakdown DTO
 */
export interface CurrencyCountBreakdownDto {
  tl: number;
  usd: number;
  eur: number;
}

/**
 * Backend'den dönen Time Period Stats DTO
 */
export interface TimePeriodStatsDto {
  count: number;
  currencyCounts: CurrencyCountBreakdownDto;
  currencyTotals: CurrencyBreakdownDto;
}

/**
 * Backend'den dönen Model Stat DTO (Cash Register)
 */
export interface ModelStatDto {
  modelId: string;
  count: number;
}

/**
 * Backend'den dönen Product Distribution DTO (SAAS)
 */
export interface ProductDistributionDto {
  productId: string;
  count: number;
}

/**
 * Backend'den dönen Monthly Trend DTO
 */
export interface MonthlyTrendDto {
  month: string;
  count: number;
}

/**
 * Backend'den dönen Cash Register Stats DTO
 */
export interface CashRegisterStatsDto {
  // Genel
  total: number;
  active: number;
  passive: number;

  // Tür bazlı
  tsm: number;
  gmp: number;

  // Periyot bazlı
  yearly: number;
  monthly: number;

  // Currency bazlı fiyat toplamları (aylık / yıllık ayrımı)
  yearlyByPrice: CurrencyBreakdownDto;
  monthlyByPrice: CurrencyBreakdownDto;

  // Zaman bazlı (bugün, bu ay, bu yıl)
  today: TimePeriodStatsDto;
  thisMonth: TimePeriodStatsDto;
  thisYear: TimePeriodStatsDto;

  // Model bazlı dağılım
  modelDistribution: ModelStatDto[];

  // Aylık trend (son 12 ay)
  monthlyTrend: MonthlyTrendDto[];
}

/**
 * Backend'den dönen SAAS Stats DTO
 */
export interface SaasStatsDto {
  // Genel
  total: number;
  active: number;
  passive: number;
  blocked: number;
  expired: number;

  // Periyot bazlı
  yearly: number;
  monthly: number;

  // Toplam miktar
  totalQty: number;

  // Currency bazlı total toplamları
  yearlyByTotal: CurrencyBreakdownDto;
  monthlyByTotal: CurrencyBreakdownDto;

  // Ürün dağılımı
  productDistribution: ProductDistributionDto[];

  // Zaman bazlı
  today: TimePeriodStatsDto;
  thisMonth: TimePeriodStatsDto;
  thisYear: TimePeriodStatsDto;

  // Aylık trend
  monthlyTrend: MonthlyTrendDto[];
}
