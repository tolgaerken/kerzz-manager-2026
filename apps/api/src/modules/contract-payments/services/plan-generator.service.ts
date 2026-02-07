import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { addMonths, startOfMonth, differenceInCalendarDays, getMonth, getYear } from "date-fns";
import { ContractPayment, ContractPaymentDocument } from "../schemas/contract-payment.schema";
import { InvoiceSummary, InvoiceRow, MonthlyPaymentStatus, YearlyPaymentStatus } from "../interfaces/payment-plan.interfaces";
import { Contract, ContractDocument } from "../../contracts/schemas/contract.schema";
import { Customer } from "../../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

@Injectable()
export class PlanGeneratorService {
  private readonly logger = new Logger(PlanGeneratorService.name);

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
  ) {}

  /**
   * Kontrat icin odeme planlari olusturur.
   * io-cloud-2025 generatePlans() + syncPlans() metodlarinin NestJS karsiligi.
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

    // Senkronize et
    await this.syncPlans(existingPlans, newPlans, customer);

    // Guncel planlari dondur
    return this.paymentModel
      .find({ contractId: contract.id })
      .sort({ payDate: 1 })
      .lean()
      .exec();
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
        id: this.generateId(),
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
        ref: `${customer.id}-${this.generateShortId()}`,
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
   */
  private async syncPlans(
    existingPlans: ContractPayment[],
    newPlans: Partial<ContractPayment>[],
    customer: Customer,
  ): Promise<void> {
    // Faturasi kesilmis planlari koru
    const invoicedPlans = existingPlans.filter((p) => p.invoiceNo && p.invoiceNo !== "");

    for (const invoicedPlan of invoicedPlans) {
      invoicedPlan.customerId = customer.id || "";
      await this.paymentModel
        .findOneAndUpdate({ id: invoicedPlan.id }, invoicedPlan)
        .exec();

      // Ayni ay icin yeni plandan cikar
      const invoicedDate = new Date(invoicedPlan.payDate);
      const matchIndex = newPlans.findIndex((np) => {
        if (!np.payDate) return false;
        const npDate = new Date(np.payDate);
        return (
          npDate.getMonth() === invoicedDate.getMonth() &&
          npDate.getFullYear() === invoicedDate.getFullYear()
        );
      });

      if (matchIndex !== -1) {
        newPlans.splice(matchIndex, 1);
      }
    }

    // Faturasiz planlari upsert et
    const uninvoicedPlans = newPlans.filter(
      (p) => !p.invoiceNo || p.invoiceNo === "",
    );

    for (const plan of uninvoicedPlans) {
      plan.customerId = customer.id || "";
      await this.paymentModel
        .findOneAndUpdate({ id: plan.id }, plan, { upsert: true, new: true })
        .exec();
    }
  }

  /**
   * Kontrat icin aylik odeme durumlarini kontrol eder.
   */
  async getMonthlyPaymentStatus(contractId: string): Promise<MonthlyPaymentStatus[]> {
    const payments = await this.paymentModel
      .find({ contractId })
      .sort({ payDate: 1 })
      .lean()
      .exec();

    return payments.map((payment) => ({
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
   * Kontrat icin yillik odeme durumunu kontrol eder.
   */
  async getYearlyPaymentStatus(contractId: string): Promise<YearlyPaymentStatus | null> {
    const payments = await this.paymentModel
      .find({ contractId })
      .lean()
      .exec();

    if (payments.length === 0) {
      return { invoice: false, payment: false, payDate: undefined, invoiceDate: undefined };
    }

    if (payments.length === 1) {
      const p = payments[0];
      return {
        invoice: !!p.invoiceNo && p.invoiceNo !== "",
        payment: p.paid || false,
        payDate: p.payDate,
        invoiceDate: p.invoiceDate,
      };
    }

    return { invoice: false, payment: false, payDate: undefined, invoiceDate: undefined };
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

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}!?@${suffix}`;
  }

  private generateShortId(): string {
    return crypto.randomUUID().substring(0, 8);
  }
}
