import { apiGet } from "../../../lib/apiClient";
import { EXCHANGE_RATES_CONSTANTS } from "../constants/exchange-rates.constants";
import type { ExchangeRatesResponse } from "../types";

const { API_BASE_URL, ENDPOINTS } = EXCHANGE_RATES_CONSTANTS;

export async function fetchExchangeRates(): Promise<ExchangeRatesResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.EXCHANGE_RATES}`;

  return apiGet<ExchangeRatesResponse>(url);
}
