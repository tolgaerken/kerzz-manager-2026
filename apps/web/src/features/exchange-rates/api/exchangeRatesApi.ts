import { EXCHANGE_RATES_CONSTANTS } from "../constants/exchange-rates.constants";
import type { ExchangeRatesResponse } from "../types";

const { API_BASE_URL, ENDPOINTS } = EXCHANGE_RATES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

export async function fetchExchangeRates(): Promise<ExchangeRatesResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.EXCHANGE_RATES}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ExchangeRatesResponse>(response);
}
