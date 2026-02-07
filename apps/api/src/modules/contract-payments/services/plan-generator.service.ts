import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, AnyBulkWriteOperation } from "mongoose";
import { addMonths, startOfMonth, getMonth, getYear } from "date-fns";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../schemas/contract-payment.schema";
import {
  InvoiceSummary,
  MonthlyPaymentStatus,
  YearlyPaymentStatus,
} from "../interfaces/payment-plan.interfaces";
import { Contract } from "../../contracts/schemas/contract.schema";
import { Customer } from "../../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { generatePaymentId, generateShortId } from "../utils/id-generator";

@Injectable()
export class PlanGeneratorService {
  private readonly logger = new Logger(PlanGeneratorService.name);

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
  ) {}

  /**
   * Kontrat icin odeme planlari olusturur ve senkronize eder.
   * Senkronizasyon sonrasi guncel plan listesini dondurur (ekstra sorgu yapmaz).
   */
  async generateAndSyncPlans(
    contract: Contract,
    invoiceSummary: InvoiceSummary,
    startDate: Date,
    monthCount: number,
    customer: Customer,
  ): Promise<ContractPayment[]> {
    // Mevcut planlari cek
    const existingPlans = await this.paymentModel
      .find({ contractId: contract.id })
      .sort({ payDate: 1 })
      .lean()
      .exec();

    // Yeni planlari olustur
    const newPlans = this.buildPlans(
      contract,
      invoiceSummary,
      startDate,
      monthCount,
      customer,
    );

    // Senkronize et ve nihai plan listesini dondur
    return this.syncPlans(existingPlans, newPlans, customer);
  }

  /**
   * Ay ay odeme plani kayitlari olusturur.
   */
  private buildPlans(
    contract: Contract,
    invoiceSummary: InvoiceSummary,
    start: Date,
    monthCount: number,
    customer: Customer,
  ): Partial<ContractPayment>[] {
    const plans: Partial<ContractPayment>[] = [];

    for (let ix = 0; ix < monthCount; ix++) {
      const date = addMonths(start, ix);

      const plan: Partial<ContractPayment> = {
        id: generatePaymentId(),
        contractId: contract.id,
        payDate: startOfMonth(date),
        total: invoiceSummary.total,
        paid: false,
        invoiceNo: "",
        company: contract.company || "",
        brand: contract.brand || "",
        taxNo: customer.taxNo || "",
        eInvoice: false,
        yearly: contract.yearly || false,
        list: invoiceSummary.rows.map((row) => ({
          id: 0,
          description: row.description,
          total: row.total,
          company: "",
          totalUsd: 0,
          totalEur: 0,
        })),
        ref: `${customer.id}-${generateShortId()}`,
        customerId: customer.id || "",
        companyId: customer.erpId || "",
        balance: 0,
        invoiceTotal: 0,
        block: false,
        contractNumber: contract.no || 0,
        internalFirm: contract.internalFirm || "",
      };

      plans.push(plan);
    }

    return plans;
  }

  /**
   * Mevcut planlar ile yeni planlari senkronize eder.
   * Faturasi kesilmis planlari korur, faturasiz planlari gunceller.
   * bulkWrite ile tek islemde DB'ye yazar ve nihai plan listesini dondurur.
   */
  private async syncPlans(
    existingPlans: ContractPayment[],
    newPlans: Partial<ContractPayment>[],
    customer: Customer,
  ): Promise<ContractPayment[]> {
    const bulkOps: AnyBulkWriteOperation<ContractPaymentDocument>[] = [];
    const finalPlans: ContractPayment[] = [];

    // Faturasi kesilmis planlari koru ve guncelle
    const invoicedPlans = existingPlans.filter(
      (p) => p.invoiceNo && p.invoiceNo !== "",
    );

    // Faturali planlarin aylarini takip et (yeni planlardan cikarilacak)
    const invoicedMonths = new Set<string>();

    for (const invoicedPlan of invoicedPlans) {
      const updatedPlan = { ...invoicedPlan, customerId: customer.id || "" };

      bulkOps.push({
        updateOne: {
          filter: { id: invoicedPlan.id },
          update: { $set: { customerId: customer.id || "" } },
        },
      });

      finalPlans.push(updatedPlan as ContractPayment);

      const invoicedDate = new Date(invoicedPlan.payDate);
      const monthKey = `${invoicedDate.getFullYear()}-${invoicedDate.getMonth()}`;
      invoicedMonths.add(monthKey);
    }

    // Faturali aylarla eslesen yeni planlari cikar
    const remainingNewPlans = newPlans.filter((np) => {
      if (!np.payDate) return true;
      const npDate = new Date(np.payDate);
      const monthKey = `${npDate.getFullYear()}-${npDate.getMonth()}`;
      return !invoicedMonths.has(monthKey);
    });

    // Faturasiz yeni planlari upsert et
    const uninvoicedPlans = remainingNewPlans.filter(
      (p) => !p.invoiceNo || p.invoiceNo === "",
    );

    for (const plan of uninvoicedPlans) {
      plan.customerId = customer.id || "";

      bulkOps.push({
        updateOne: {
          filter: { id: plan.id },
          update: { $set: plan },
          upsert: true,
        },
      });

      finalPlans.push(plan as ContractPayment);
    }

    // Tek seferde DB'ye yaz
    if (bulkOps.length > 0) {
      await this.paymentModel.bulkWrite(bulkOps);
    }

    // payDate'e gore sirala
    finalPlans.sort(
      (a, b) =>
        new Date(a.payDate).getTime() - new Date(b.payDate).getTime(),
    );

    return finalPlans;
  }

  /**
   * Plan listesinden aylik odeme durumlarini hesaplar (DB sorgusu yapmaz).
   */
  static buildMonthlyPaymentStatus(
    plans: ContractPayment[],
  ): MonthlyPaymentStatus[] {
    return plans.map((payment) => ({
      year: getYear(payment.payDate).toString(),
      month: (getMonth(payment.payDate) + 1).toString(),
      invoice: !!payment.invoiceNo && payment.invoiceNo !== "",
      payment: payment.paid || false,
      payDate: new Date(
        getYear(payment.payDate),
        getMonth(payment.payDate),
        1,
      ),
      invoiceDate: payment.invoiceDate,
    }));
  }

  /**
   * Plan listesinden yillik odeme durumunu hesaplar (DB sorgusu yapmaz).
   */
  static buildYearlyPaymentStatus(
    plans: ContractPayment[],
  ): YearlyPaymentStatus | null {
    if (plans.length === 0) {
      return {
        invoice: false,
        payment: false,
        payDate: undefined,
        invoiceDate: undefined,
      };
    }

    if (plans.length === 1) {
      const p = plans[0];
      return {
        invoice: !!p.invoiceNo && p.invoiceNo !== "",
        payment: p.paid || false,
        payDate: p.payDate,
        invoiceDate: p.invoiceDate,
      };
    }

    return {
      invoice: false,
      payment: false,
      payDate: undefined,
      invoiceDate: undefined,
    };
  }

  /**
   * Kontrat icin aylik odeme durumlarini kontrol eder (DB'den okur).
   * Disaridan bagimsiz cagrildiginda kullanilir.
   */
  async getMonthlyPaymentStatus(
    contractId: string,
  ): Promise<MonthlyPaymentStatus[]> {
    const payments = await this.paymentModel
      .find({ contractId })
      .sort({ payDate: 1 })
      .lean()
      .exec();

    return PlanGeneratorService.buildMonthlyPaymentStatus(payments);
  }

  /**
   * Kontrat icin yillik odeme durumunu kontrol eder (DB'den okur).
   * Disaridan bagimsiz cagrildiginda kullanilir.
   */
  async getYearlyPaymentStatus(
    contractId: string,
  ): Promise<YearlyPaymentStatus | null> {
    const payments = await this.paymentModel
      .find({ contractId })
      .lean()
      .exec();

    return PlanGeneratorService.buildYearlyPaymentStatus(payments);
  }

  /**
   * Kontratin faturasi kesilmemis planlarini siler.
   */
  async deleteUninvoicedPlans(contractId: string): Promise<number> {
    const result = await this.paymentModel
      .deleteMany({
        contractId,
        $or: [{ invoiceNo: "" }, { invoiceNo: { $exists: false } }],
      })
      .exec();

    return result.deletedCount;
  }

  /**
   * Kontrata ait odeme planlarini dondurur.
   */
  async getPaymentPlans(contractId: string): Promise<ContractPayment[]> {
    return this.paymentModel
      .find({ contractId })
      .sort({ payDate: 1 })
      .lean()
      .exec();
  }
}
