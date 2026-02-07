import { Controller, Get } from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";

@Controller("exchange-rates")
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  async getRates() {
    const rates = await this.exchangeRateService.getRates();
    return {
      usd: rates.usd,
      eur: rates.eur,
      lastUpdated: new Date(),
    };
  }
}
