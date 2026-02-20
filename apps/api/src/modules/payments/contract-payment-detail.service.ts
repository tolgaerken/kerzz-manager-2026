import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { PaymentLink, PaymentLinkDocument } from "./schemas/payment-link.schema";
import { Contract, ContractDocument } from "../contracts/schemas/contract.schema";
import {
  ContractCashRegister,
  ContractCashRegisterDocument,
} from "../contract-cash-registers/schemas/contract-cash-register.schema";
import {
  ContractSupport,
  ContractSupportDocument,
} from "../contract-supports/schemas/contract-support.schema";
import {
  ContractItem,
  ContractItemDocument,
} from "../contract-items/schemas/contract-item.schema";
import {
  ContractSaas,
  ContractSaasDocument,
} from "../contract-saas/schemas/contract-saas.schema";
import {
  ContractVersion,
  ContractVersionDocument,
} from "../contract-versions/schemas/contract-version.schema";
import {
  InflationRate,
  InflationRateDocument,
} from "../inflation-rates/schemas/inflation-rate.schema";
import { ExchangeRateService } from "../exchange-rate";
import type {
  ContractPaymentDetailDto,
  ContractPaymentItemDto,
  ContractItemCategory,
  CurrencyBreakdown,
} from "./dto/contract-payment-detail.dto";

type CurrencyType = "tl" | "usd" | "eur";

@Injectable()
export class ContractPaymentDetailService {
  private readonly logger = new Logger(ContractPaymentDetailService.name);

  constructor(
    @InjectModel(PaymentLink.name, CONTRACT_DB_CONNECTION)
    private paymentLinkModel: Model<PaymentLinkDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
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

  async getContractDetailForPayment(linkId: string): Promise<ContractPaymentDetailDto> {
    const paymentLink = await this.paymentLinkModel
      .findOne({
        $or: [
          { linkId },
          ...(Types.ObjectId.isValid(linkId) && linkId.length === 24
            ? [{ _id: new Types.ObjectId(linkId) }]
            : []),
        ],
      })
      .lean()
      .exec();

    if (!paymentLink) {
      throw new NotFoundException(`Ödeme linki bulunamadı: ${linkId}`);
    }

    const doc = paymentLink as unknown as {
      contextType?: string;
      contextId?: string;
      amount?: number;
    };

    if (doc.contextType !== "contract") {
      throw new BadRequestException("Bu ödeme linki bir kontrat ödemesi değil");
    }

    if (!doc.contextId) {
      throw new BadRequestException("Kontrat ID bulunamadı");
    }

    const contract = await this.contractModel
      .findOne({ id: doc.contextId })
      .lean()
      .exec();

    if (!contract) {
      throw new NotFoundException(`Kontrat bulunamadı: ${doc.contextId}`);
    }

    const contractDoc = contract as unknown as {
      id: string;
      contractId: string;
      brand: string;
      company: string;
      startDate: Date | string;
      endDate: Date | string;
      yearly: boolean;
      incraseRateType?: string;
      incrasePeriod?: string;
    };

    const [
      cashRegisters,
      supports,
      items,
      saasItems,
      versions,
      latestInflation,
      exchangeRates,
    ] = await Promise.all([
      this.cashRegisterModel.find({ contractId: contractDoc.id, enabled: true }).lean().exec(),
      this.supportModel.find({ contractId: contractDoc.id, enabled: true }).lean().exec(),
      this.itemModel.find({ contractId: contractDoc.id, enabled: true }).lean().exec(),
      this.saasModel.find({ contractId: contractDoc.id, enabled: true }).lean().exec(),
      this.versionModel.find({ contractId: contractDoc.id, enabled: true }).lean().exec(),
      this.getLatestInflationRate(),
      this.exchangeRateService.getRates(),
    ]);

    const tlIncreaseRate = latestInflation ? latestInflation.average / 100 : 0;
    const USD_FIXED_INCREASE_RATE = 0.05;
    const EUR_FIXED_INCREASE_RATE = 0.05;

    const inflationSource = latestInflation
      ? `${latestInflation.year}/${latestInflation.month} ortalama: %${latestInflation.average}`
      : "Enflasyon verisi bulunamadı";

    const breakdown: CurrencyBreakdown = {
      tl: { old: 0, new: 0 },
      usd: { old: 0, new: 0, convertedToTL: 0 },
      eur: { old: 0, new: 0, convertedToTL: 0 },
    };

    const detailedItems: ContractPaymentItemDto[] = [];

    const processItem = (
      item: {
        price: number;
        old_price?: number;
        currency?: string;
        brand?: string;
        description?: string;
        model?: string;
        type?: string;
      },
      category: ContractItemCategory,
      qty = 1
    ) => {
      const currency = (item.currency?.toLowerCase() || "tl") as CurrencyType;
      const currentPrice = item.price || 0;

      let increaseRate = 0;
      if (currency === "tl") {
        increaseRate = tlIncreaseRate;
      } else if (currency === "usd") {
        increaseRate = USD_FIXED_INCREASE_RATE;
      } else if (currency === "eur") {
        increaseRate = EUR_FIXED_INCREASE_RATE;
      }

      const oldPrice = currentPrice;
      const newPrice = this.safeRound(currentPrice * (1 + increaseRate));
      const oldTotal = this.safeRound(oldPrice * qty);
      const newTotal = this.safeRound(newPrice * qty);
      const changePercent = oldPrice > 0 ? this.safeRound(((newPrice - oldPrice) / oldPrice) * 100) : 0;

      let description = item.description || item.brand || "";
      if (category === "eftpos" && item.model) {
        description = `${item.brand || ""} ${item.model}`.trim();
      }
      if (category === "support" || category === "version") {
        description = `${item.brand || ""} ${item.type || ""}`.trim();
      }

      detailedItems.push({
        category,
        description,
        brand: item.brand || "",
        currency,
        qty,
        oldPrice,
        newPrice,
        oldTotal,
        newTotal,
        changePercent,
      });

      if (currency === "tl") {
        breakdown.tl.old += oldTotal;
        breakdown.tl.new += newTotal;
      } else if (currency === "usd") {
        breakdown.usd.old += oldTotal;
        breakdown.usd.new += newTotal;
        breakdown.usd.convertedToTL += this.safeRound(newTotal * exchangeRates.usd);
      } else if (currency === "eur") {
        breakdown.eur.old += oldTotal;
        breakdown.eur.new += newTotal;
        breakdown.eur.convertedToTL += this.safeRound(newTotal * exchangeRates.eur);
      }
    };

    for (const cr of cashRegisters) {
      processItem(
        cr as unknown as { price: number; old_price?: number; currency?: string; brand?: string; model?: string },
        "eftpos"
      );
    }
    for (const s of supports) {
      processItem(
        s as unknown as { price: number; old_price?: number; currency?: string; brand?: string; type?: string },
        "support"
      );
    }
    for (const i of items) {
      const itemDoc = i as unknown as { price: number; old_price?: number; currency?: string; description?: string; qty?: number };
      processItem(itemDoc, "item", itemDoc.qty || 1);
    }
    for (const ss of saasItems) {
      const saasDoc = ss as unknown as { price: number; old_price?: number; currency?: string; brand?: string; description?: string; qty?: number };
      processItem(saasDoc, "saas", saasDoc.qty || 1);
    }
    for (const v of versions) {
      processItem(
        v as unknown as { price: number; old_price?: number; currency?: string; brand?: string; type?: string },
        "version"
      );
    }

    const oldTotalTL = this.safeRound(
      breakdown.tl.old +
        breakdown.usd.old * exchangeRates.usd +
        breakdown.eur.old * exchangeRates.eur
    );

    const newTotalTL = this.safeRound(
      breakdown.tl.new +
        breakdown.usd.new * exchangeRates.usd +
        breakdown.eur.new * exchangeRates.eur
    );

    const increaseRate = oldTotalTL > 0 ? this.safeRound(((newTotalTL - oldTotalTL) / oldTotalTL) * 100) : 0;

    return {
      contract: {
        contractId: contractDoc.contractId,
        brand: contractDoc.brand,
        company: contractDoc.company,
        startDate: contractDoc.startDate instanceof Date
          ? contractDoc.startDate.toISOString()
          : String(contractDoc.startDate),
        endDate: contractDoc.endDate instanceof Date
          ? contractDoc.endDate.toISOString()
          : String(contractDoc.endDate),
        yearly: contractDoc.yearly,
        incraseRateType: contractDoc.incraseRateType || "yi-ufe",
        incrasePeriod: contractDoc.incrasePeriod || "3-month",
      },
      items: detailedItems,
      summary: {
        oldTotalTL,
        newTotalTL,
        increaseRate,
        inflationSource,
        currencyBreakdown: breakdown,
      },
      paymentAmount: doc.amount || newTotalTL,
    };
  }

  private async getLatestInflationRate(): Promise<InflationRate | null> {
    const result = await this.inflationRateModel
      .findOne({ country: "tr" })
      .sort({ date: -1 })
      .lean()
      .exec();

    return result;
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.round(value * 100) / 100;
  }
}
