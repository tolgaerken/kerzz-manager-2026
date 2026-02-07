import { useEffect, useState, useCallback } from "react";
import { fetchExchangeRates } from "../api";
import { EXCHANGE_RATES_CONSTANTS } from "../constants/exchange-rates.constants";
import type { DisplayExchangeRates } from "../types";

const { MARGIN_PERCENTAGE, REFRESH_INTERVAL } = EXCHANGE_RATES_CONSTANTS;

interface UseExchangeRatesReturn {
  rates: DisplayExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function applyMargin(rate: number): number {
  return rate * (1 + MARGIN_PERCENTAGE / 100);
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<DisplayExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchExchangeRates();
      
      setRates({
        usd: data.usd,
        eur: data.eur,
        usdWithMargin: applyMargin(data.usd),
        eurWithMargin: applyMargin(data.eur),
        lastUpdated: new Date(data.lastUpdated),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kurlar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRates();

    // Kurları belirli aralıklarla yenile
    const intervalId = setInterval(() => {
      void fetchRates();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchRates]);

  return {
    rates,
    isLoading,
    error,
    refetch: fetchRates,
  };
}
