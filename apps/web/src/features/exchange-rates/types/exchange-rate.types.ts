export interface ExchangeRatesResponse {
  usd: number;
  eur: number;
  lastUpdated: string;
}

export interface DisplayExchangeRates {
  usd: number;
  eur: number;
  usdWithMargin: number;
  eurWithMargin: number;
  lastUpdated: Date;
}
