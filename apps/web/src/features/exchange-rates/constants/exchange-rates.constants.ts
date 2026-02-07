export const EXCHANGE_RATES_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    EXCHANGE_RATES: "/exchange-rates",
  },
  /** Kurlara eklenecek margin yüzdesi */
  MARGIN_PERCENTAGE: 2.5,
  /** Kurların yenilenme süresi (ms) - 5 dakika */
  REFRESH_INTERVAL: 5 * 60 * 1000,
} as const;
