import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, isValidObjectId } from "mongoose";
import {
  startOfMonth,
  endOfMonth,
  differenceInCalendarMonths,
} from "date-fns";
import { InvoiceCalculatorService } from "./invoice-calculator.service";
import { PlanGeneratorService } from "./plan-generator.service";
import {
  Contract,
  ContractDocument,
} from "../../contracts/schemas/contract.schema";
import {
  Customer,
  CustomerDocument,
} from "../../customers/schemas/customer.schema";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../schemas/contract-payment.schema";
import {
  InvoiceSummary,
  PaymentPlanResult,
} from "../interfaces/payment-plan.interfaces";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { DEFAULT_CONCURRENCY_LIMIT } from "../constants/invoice.constants";

@Injectable()
export class PaymentPlanService {
  private readonly logger = new Logger(PaymentPlanService.name);

  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
    private readonly invoiceCalculator: InvoiceCalculatorService,
    private readonly planGenerator: PlanGeneratorService,
  ) {}

  /**
   * Tek bir kontrat icin odeme planini kontrol eder ve olusturur.
   * Tekrar eden DB sorgularini onlemek icin processContract'tan
   * donen planlari dogrudan kullanir.
   */
  async checkContractById(contractId: string): Promise<{
    plans: ContractPayment[];
    invoiceSummary: InvoiceSummary;
    result: PaymentPlanResult;
  }> {
    const contract = await this.contractModel
      .findOne({ id: contractId })
      .lean()
      .exec();

    if (!contract) {
      throw new NotFoundException(`Kontrat bulunamadi: ${contractId}`);
    }

    // Faturasi kesilmemis planlari sil
    await this.planGenerator.deleteUninvoicedPlans(contractId);

    // Kontrati isle - plans zaten processContract'tan donuyor
    const result = await this.processContract(contract);

    return {
      plans: result.plans,
      invoiceSummary: result.invoiceSummary,
      result: result.planResult,
    };
  }

  /**
   * Tum kontratlari kontrol eder ve planlarini olusturur.
   * Concurrency-limited parallel islem ile performansi arttirir.
   */
  async checkAllContracts(): Promise<{
    processed: number;
    errors: Array<{ contractId: string; error: string }>;
  }> {
    const now = new Date();

    // Sadece aktif kontratlari al (startDate <= now && endDate >= now)
    const contracts = await this.contractModel
      .find({
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .lean()
      .exec();

    this.logger.log(`Checking ${contracts.length} active contracts...`);

    let processed = 0;
    const errors: Array<{ contractId: string; error: string }> = [];

    // Concurrency-limited parallel processing
    const chunks = this.chunkArray(contracts, DEFAULT_CONCURRENCY_LIMIT);

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(async (contract) => {
          // Faturasi kesilmemis planlari sil
          await this.planGenerator.deleteUninvoicedPlans(contract.id);

          // Kontrati isle
          await this.processContract(contract);

          return contract;
        }),
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const contract = chunk[i];

        if (result.status === "fulfilled") {
          processed++;
          this.logger.log(
            `[${processed}/${contracts.length}] ${contract.company} islendi`,
          );
        } else {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error";
          this.logger.error(`Contract ${contract.id} failed: ${message}`);
          errors.push({ contractId: contract.id, error: message });
        }
      }
    }

    this.logger.log(
      `Check completed: ${processed} processed, ${errors.length} errors`,
    );

    return { processed, errors };
  }

  /**
   * Kontrat icin odeme plani ve fatura ozetini onizler (DB'ye yazmaz).
   */
  async previewPlans(contractId: string): Promise<{
    plans: ContractPayment[];
    invoiceSummary: InvoiceSummary;
  }> {
    const plans = await this.planGenerator.getPaymentPlans(contractId);
    const invoiceSummary =
      await this.invoiceCalculator.calculateMonthlyFee(contractId);

    return { plans, invoiceSummary };
  }

  /**
   * Kontrat icin aylik ucret hesaplar.
   */
  async calculateMonthlyFee(contractId: string): Promise<InvoiceSummary> {
    return this.invoiceCalculator.calculateMonthlyFee(contractId);
  }

  /**
   * Tek bir kontrati isler: fatura hesapla, plan olustur, kontrati guncelle.
   * Tum hesaplamalari tek noktada toplar, tekrar eden DB sorgularini onler.
   */
  private async processContract(contract: Contract): Promise<{
    invoiceSummary: InvoiceSummary;
    planResult: PaymentPlanResult;
    plans: ContractPayment[];
  }> {
    // Musteri bilgisini bul (tek $or sorgusu ile)
    const customer = await this.findCustomer(contract.customerId);
    if (!customer) {
      this.logger.warn(`Musteri bulunamadi: ${contract.customerId}`);
      return {
        invoiceSummary: this.emptyInvoiceSummary(),
        planResult: { total: 0, length: 0 },
        plans: [],
      };
    }

    // Brand bilgisini musteriden al
    contract.brand = customer.name || contract.brand;

    // Fatura ozeti ve alt toplamlari tek seferde hesapla
    const { invoiceSummary, subTotals } =
      await this.invoiceCalculator.calculateAll(contract.id);

    // Ay sayisini hesapla
    const start = startOfMonth(contract.startDate);
    const end = endOfMonth(contract.endDate);
    const monthCount = contract.yearly
      ? 1
      : differenceInCalendarMonths(end, start) + 1;

    // Plan olustur ve senkronize et - donen planlar memory'de tutulur
    const plans = await this.planGenerator.generateAndSyncPlans(
      contract,
      invoiceSummary,
      start,
      monthCount,
      customer,
    );

    // Kontrat toplamlarini guncelle - NaN degerlerini 0 ile degistir
    const sanitizedSubTotals = Object.fromEntries(
      Object.entries(subTotals).map(([key, value]) => [
        key,
        typeof value === "number" && isFinite(value) ? value : 0,
      ]),
    );

    const updateData: Record<string, unknown> = {
      ...sanitizedSubTotals,
      paymentLength: plans.length,
    };

    if (contract.yearly) {
      updateData.yearlyTotal = invoiceSummary.total;
      updateData.total = 0;
    } else {
      updateData.yearlyTotal = 0;
      updateData.total = invoiceSummary.total;
    }

    // Aylik odeme durumlarini memory'deki planlardan hesapla (DB sorgusu yapmaz)
    updateData.monthlyPayments =
      PlanGeneratorService.buildMonthlyPaymentStatus(plans);

    // Yillik odeme durumu
    if (contract.yearly) {
      const yearlyPayment =
        PlanGeneratorService.buildYearlyPaymentStatus(plans);
      if (yearlyPayment) {
        updateData.yearlyPayment = yearlyPayment;
      }
    }

    // Kontrati guncelle
    await this.contractModel
      .findOneAndUpdate({ id: contract.id }, updateData)
      .exec();

    return {
      invoiceSummary,
      planResult: {
        total: invoiceSummary.total,
        length: plans.length,
      },
      plans,
    };
  }

  /**
   * Musteri arar: customerId ile tek $or sorgusu kullanir.
   * ObjectId gecerliyse _id, degilse id ve erpId uzerinden arar.
   */
  private async findCustomer(customerId: string): Promise<Customer | null> {
    const orConditions: Array<Record<string, string>> = [
      { id: customerId },
      { erpId: customerId },
    ];

    // Gecerli ObjectId ise _id ile de ara
    if (isValidObjectId(customerId)) {
      orConditions.unshift({ _id: customerId });
    }

    return this.customerModel
      .findOne({ $or: orConditions })
      .lean()
      .exec();
  }

  /**
   * Diziyi belirli boyutlarda parcalara boler (chunk).
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private emptyInvoiceSummary(): InvoiceSummary {
    return {
      id: "",
      total: 0,
      rows: [],
      support: [],
      eftpos: [],
      item: [],
      saas: [],
      version: [],
    };
  }
}
