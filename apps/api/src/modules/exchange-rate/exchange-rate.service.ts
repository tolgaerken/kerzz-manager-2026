import { Injectable, Logger } from "@nestjs/common";

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private cache: CachedRates | null = null;
  private readonly CACHE_TTL = 3_600_000; // 1 saat
  private readonly API_URL =
    "https://api.exchangerate-api.com/v4/latest/TRY";

  /**
   * Verilen para birimi icin TL bazinda kur dondurur.
   * tl -> 1, usd -> 1/USD_RATE, eur -> 1/EUR_RATE
   *
   * Ornek: 1 USD = 43.67 TL ise, API'den TRY->USD = 0.0229
   * exchange("usd") => 1 / 0.0229 ≈ 43.67
   */
  async getRate(currency: "tl" | "usd" | "eur"): Promise<number> {
    if (currency === "tl") return 1;

    const rates = await this.fetchRates();
    const rateKey = currency.toUpperCase();
    const rate = rates[rateKey];

    if (!rate || rate === 0) {
      this.logger.warn(`Rate not found for currency: ${currency}, defaulting to 1`);
      return 1;
    }

    // API TRY bazli donuyor (1 TRY = X USD)
    // Biz 1 USD = ? TL istiyoruz: 1 / rate
    return parseFloat((1 / rate).toFixed(4));
  }

  /**
   * Tum kurlari dondurur (USD ve EUR icin TL karsiligi)
   */
  async getRates(): Promise<{ usd: number; eur: number }> {
    const [usd, eur] = await Promise.all([
      this.getRate("usd"),
      this.getRate("eur"),
    ]);
    return { usd, eur };
  }

  /**
   * API'den kurlari ceker, cache suresi dolmamissa cache'den dondurur.
   */
  private async fetchRates(): Promise<Record<string, number>> {
    const now = Date.now();

    if (this.cache && now - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.rates;
    }

    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`Exchange rate API returned ${response.status}`);
      }

      const data = await response.json();
      this.cache = { rates: data.rates, timestamp: now };
      this.logger.log("Exchange rates updated successfully");
      return data.rates;
    } catch (error) {
      this.logger.error("Failed to fetch exchange rates", error);

      // Cache varsa eski veriyi kullan
      if (this.cache) {
        this.logger.warn("Using stale cached exchange rates");
        return this.cache.rates;
      }

      // Fallback varsayilan degerler
      this.logger.warn("Using fallback exchange rates");
      return { USD: 0.0229, EUR: 0.0194 };
    }
  }
}
