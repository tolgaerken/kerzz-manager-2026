import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { startOfMonth, endOfMonth, differenceInCalendarMonths } from "date-fns";
import { InvoiceCalculatorService } from "./invoice-calculator.service";
import { PlanGeneratorService } from "./plan-generator.service";
import { Contract, ContractDocument } from "../../contracts/schemas/contract.schema";
import { Customer, CustomerDocument } from "../../customers/schemas/customer.schema";
import { ContractPayment, ContractPaymentDocument } from "../schemas/contract-payment.schema";
import { InvoiceSummary, PaymentPlanResult, CheckContractNotification } from "../interfaces/payment-plan.interfaces";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

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
   * io-cloud-2025 checkContractById() metodunun NestJS karsiligi.
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

    // Kontrati isle
    const result = await this.processContract(contract);

    // Guncel planlari cek
    const plans = await this.planGenerator.getPaymentPlans(contractId);

    return {
      plans,
      invoiceSummary: result.invoiceSummary,
      result: result.planResult,
    };
  }

  /**
   * Tum kontratlari kontrol eder ve planlarini olusturur.
   * io-cloud-2025 checkContracts() metodunun NestJS karsiligi.
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

    for (const contract of contracts) {
      try {
        // Faturasi kesilmemis planlari sil
        await this.planGenerator.deleteUninvoicedPlans(contract.id);

        // Kontrati isle
        await this.processContract(contract);
        processed++;

        this.logger.log(
          `[${processed}/${contracts.length}] ${contract.company} islendi`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(`Contract ${contract.id} failed: ${message}`);
        errors.push({ contractId: contract.id, error: message });
      }
    }

    this.logger.log(
      `Check completed: ${processed} processed, ${errors.length} errors`,
    );

    return { processed, errors };
  }

  /**
   * Kontrat icin odeme plani ve fatura ozetini onizler (DB'ye yazmaz).
   * io-cloud-2025 previewPlans() metodunun NestJS karsiligi.
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
   * io-cloud-2025 checkContract() metodunun NestJS karsiligi.
   */
  private async processContract(contract: Contract): Promise<{
    invoiceSummary: InvoiceSummary;
    planResult: PaymentPlanResult;
  }> {
    // Musteri bilgisini bul
    const customer = await this.findCustomer(contract.customerId);
    if (!customer) {
      this.logger.warn(`Musteri bulunamadi: ${contract.customerId}`);
      return {
        invoiceSummary: this.emptyInvoiceSummary(),
        planResult: { total: 0, length: 0 },
      };
    }

    // Brand bilgisini musteriden al
    contract.brand = customer.name || contract.brand;

    // Fatura ozetini hesapla
    const invoiceSummary =
      await this.invoiceCalculator.calculateMonthlyFee(contract.id);

    // Alt toplam hesapla ve kontrata yaz
    const subTotals =
      await this.invoiceCalculator.calculateSubTotals(contract.id);

    // Ay sayisini hesapla
    const start = startOfMonth(contract.startDate);
    const end = endOfMonth(contract.endDate);
    const monthCount = contract.yearly
      ? 1
      : differenceInCalendarMonths(end, start) + 1;

    // Plan olustur ve senkronize et
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

    // Aylik odeme durumlarini hesapla
    const monthlyPayments =
      await this.planGenerator.getMonthlyPaymentStatus(contract.id);
    updateData.monthlyPayments = monthlyPayments;

    // Yillik odeme durumu
    if (contract.yearly) {
      const yearlyPayment =
        await this.planGenerator.getYearlyPaymentStatus(contract.id);
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
    };
  }

  /**
   * Musteri arar: customerId ile _id, id veya erpId uzerinden
   */
  private async findCustomer(customerId: string): Promise<Customer | null> {
    // Once _id ile dene
    let customer = await this.customerModel
      .findById(customerId)
      .lean()
      .exec()
      .catch(() => null);

    // Sonra id ile dene
    if (!customer) {
      customer = await this.customerModel
        .findOne({ id: customerId })
        .lean()
        .exec();
    }

    // Son olarak erpId ile dene
    if (!customer) {
      customer = await this.customerModel
        .findOne({ erpId: customerId })
        .lean()
        .exec();
    }

    return customer;
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
