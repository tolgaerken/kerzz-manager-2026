import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { HELPERS_DB_CONNECTION } from "../../../database/helpers-database.module";
import {
  ContractCashRegister,
  ContractCashRegisterDocument,
} from "../../contract-cash-registers/schemas/contract-cash-register.schema";
import {
  ContractSupport,
  ContractSupportDocument,
} from "../../contract-supports/schemas/contract-support.schema";
import {
  ContractItem,
  ContractItemDocument,
} from "../../contract-items/schemas/contract-item.schema";
import {
  ContractSaas,
  ContractSaasDocument,
} from "../../contract-saas/schemas/contract-saas.schema";
import {
  ContractVersion,
  ContractVersionDocument,
} from "../../contract-versions/schemas/contract-version.schema";
import {
  InflationRate,
  InflationRateDocument,
} from "../../inflation-rates/schemas/inflation-rate.schema";
import { ExchangeRateService } from "../../exchange-rate";

export interface RenewalPricingResult {
  contractId: string;
  oldTotalTL: number;
  newTotalTL: number;
  tlIncreaseRate: number;
  usdIncreaseRate: number;
  currencyBreakdown: {
    tl: { old: number; new: number };
    usd: { old: number; new: number; convertedToTL: number };
    eur: { old: number; new: number; convertedToTL: number };
  };
  inflationSource: string;
}

type CurrencyType = "tl" | "usd" | "eur";

const USD_FIXED_INCREASE_RATE = 0.05;
const EUR_FIXED_INCREASE_RATE = 0.05;

@Injectable()
export class AnnualContractRenewalPricingService {
  private readonly logger = new Logger(AnnualContractRenewalPricingService.name);

  constructor(
    @InjectModel(ContractCashRegister.name, CONTRACT_DB_CONNECTION)
    private cashRegisterModel: Model<ContractCashRegisterDocument>,
    @InjectModel(ContractSupport.name, CONTRACT_DB_CONNECTION)
    private supportModel: Model<ContractSupportDocument>,
    @InjectModel(ContractItem.name, CONTRACT_DB_CONNECTION)
    private itemModel: Model<ContractItemDocument>,
    @InjectModel(ContractSaas.name, CONTRACT_DB_CONNECTION)
    private saasModel: Model<ContractSaasDocument>,
    @InjectModel(ContractVersion.name, CONTRACT_DB_CONNECTION)
    private versionModel: Model<ContractVersionDocument>,
    @InjectModel(InflationRate.name, HELPERS_DB_CONNECTION)
    private inflationRateModel: Model<InflationRateDocument>,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * Yıllık kontrat için yenileme fiyatını hesaplar.
   * TL: En güncel enflasyon average oranıyla artırılır.
   * USD/EUR: Sabit %5 artırılır.
   */
  async calculateRenewalPrice(contractId: string): Promise<RenewalPricingResult> {
    const [
      cashRegisters,
      supports,
      items,
      saasItems,
      versions,
      latestInflation,
      exchangeRates,
    ] = await Promise.all([
      this.cashRegisterModel.find({ contractId, enabled: true }).lean().exec(),
      this.supportModel.find({ contractId, enabled: true }).lean().exec(),
      this.itemModel.find({ contractId, enabled: true }).lean().exec(),
      this.saasModel.find({ contractId, enabled: true }).lean().exec(),
      this.versionModel.find({ contractId, enabled: true }).lean().exec(),
      this.getLatestInflationRate(),
      this.exchangeRateService.getRates(),
    ]);

    const tlIncreaseRate = latestInflation ? latestInflation.average / 100 : 0;
    const inflationSource = latestInflation
      ? `${latestInflation.year}/${latestInflation.month} average: ${latestInflation.average}%`
      : "Enflasyon verisi bulunamadı";

    const allItems = [
      ...cashRegisters.map((i) => this.mapItem(i)),
      ...supports.map((i) => this.mapItem(i)),
      ...items.map((i) => this.mapItem(i, i.qty)),
      ...saasItems.map((i) => this.mapItem(i, i.qty)),
      ...versions.map((i) => this.mapItem(i)),
    ];

    const breakdown = {
      tl: { old: 0, new: 0 },
      usd: { old: 0, new: 0, convertedToTL: 0 },
      eur: { old: 0, new: 0, convertedToTL: 0 },
    };

    for (const item of allItems) {
      const currency = (item.currency?.toLowerCase() || "tl") as CurrencyType;
      const oldPrice = item.price * item.qty;

      if (currency === "tl") {
        const newPrice = this.safeRound(oldPrice * (1 + tlIncreaseRate));
        breakdown.tl.old += oldPrice;
        breakdown.tl.new += newPrice;
      } else if (currency === "usd") {
        const newPrice = this.safeRound(oldPrice * (1 + USD_FIXED_INCREASE_RATE));
        breakdown.usd.old += oldPrice;
        breakdown.usd.new += newPrice;
        breakdown.usd.convertedToTL += this.safeRound(newPrice * exchangeRates.usd);
      } else if (currency === "eur") {
        const newPrice = this.safeRound(oldPrice * (1 + EUR_FIXED_INCREASE_RATE));
        breakdown.eur.old += oldPrice;
        breakdown.eur.new += newPrice;
        breakdown.eur.convertedToTL += this.safeRound(newPrice * exchangeRates.eur);
      }
    }

    const oldTotalTL = this.safeRound(
      breakdown.tl.old +
        breakdown.usd.old * exchangeRates.usd +
        breakdown.eur.old * exchangeRates.eur
    );

    const newTotalTL = this.safeRound(
      breakdown.tl.new + breakdown.usd.convertedToTL + breakdown.eur.convertedToTL
    );

    return {
      contractId,
      oldTotalTL,
      newTotalTL,
      tlIncreaseRate,
      usdIncreaseRate: USD_FIXED_INCREASE_RATE,
      currencyBreakdown: breakdown,
      inflationSource,
    };
  }

  /**
   * En güncel enflasyon kaydını getirir (date'e göre sıralı).
   */
  private async getLatestInflationRate(): Promise<InflationRate | null> {
    const result = await this.inflationRateModel
      .findOne({ country: "tr" })
      .sort({ date: -1 })
      .lean()
      .exec();

    return result;
  }

  private mapItem(
    item: { price: number; currency?: string },
    qty = 1
  ): { price: number; currency: string; qty: number } {
    return {
      price: item.price || 0,
      currency: item.currency || "tl",
      qty: qty || 1,
    };
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.round(value * 100) / 100;
  }
}
