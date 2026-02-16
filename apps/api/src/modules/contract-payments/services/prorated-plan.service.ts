import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, isValidObjectId } from "mongoose";
import {
  utcEndOfMonth,
  utcDifferenceInCalendarDays,
} from "../../contract-invoices/utils/date.utils";
import {
  ContractPayment,
  ContractPaymentDocument,
  PaymentListItem,
} from "../schemas/contract-payment.schema";
import {
  Contract,
  ContractDocument,
} from "../../contracts/schemas/contract.schema";
import {
  Customer,
  CustomerDocument,
} from "../../customers/schemas/customer.schema";
import { ExchangeRateService } from "../../exchange-rate";
import { CurrencyType } from "../interfaces/payment-plan.interfaces";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { generatePaymentId, generateShortId } from "../utils/id-generator";

/** Kist plan olusturmak icin gereken kalem bilgisi */
export interface ProratedItemInput {
  price: number;
  currency: string;
  startDate: Date;
  qty?: number;
}

@Injectable()
export class ProratedPlanService {
  private readonly logger = new Logger(ProratedPlanService.name);

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * Kontrata eklenen yeni kalem icin kist odeme plani olusturur.
   * Fatura kesmez — sadece plan kaydeder. Fatura kesimi cron tarafindan yapilir.
   *
   * Eger ilgili ayin regular plani henuz faturalanmamissa, kist plan olusturmaz
   * ve null dondurur. Bu durumda regular plan kist tutarla olusturulacaktir.
   */
  async createProratedPlan(
    contractId: string,
    item: ProratedItemInput,
    description: string,
  ): Promise<ContractPayment | null> {
    // Ay faturasi henuz kesilmemisse kist plan olusturma
    const alreadyInvoiced = await this.isMonthAlreadyInvoiced(
      contractId,
      new Date(item.startDate),
    );
    if (!alreadyInvoiced) {
      this.logger.log(
        `Kist plan atlaniyor: ${contractId} - ay henuz faturalanmamis, regular plan kist hesaplanacak`,
      );
      return null;
    }

    const contract = await this.contractModel
      .findOne({ id: contractId })
      .lean()
      .exec();

    if (!contract) {
      throw new NotFoundException(`Kontrat bulunamadi: ${contractId}`);
    }

    const customer = await this.findCustomer(contract.customerId);
    if (!customer) {
      throw new NotFoundException(
        `Musteri bulunamadi: ${contract.customerId}`,
      );
    }

    const startDate = new Date(item.startDate);
    const monthEnd = utcEndOfMonth(startDate);
    const daysInMonth = this.getDaysInMonth(startDate);
    const remainingDays =
      utcDifferenceInCalendarDays(monthEnd, startDate) + 1;

    // Doviz cevrimi
    const rate = await this.exchangeRateService.getRate(
      item.currency as CurrencyType,
    );
    const rawPrice = (Number(item.price) || 0) * (item.qty || 1);
    const monthlyPrice = this.safeRound(rawPrice * rate);

    // Kist tutar hesapla
    const dailyRate = monthlyPrice / daysInMonth;
    const proratedAmount = this.safeRound(dailyRate * remainingDays);

    const startStr = this.formatDateShort(startDate);
    const endStr = this.formatDateShort(monthEnd);

    const listItem: PaymentListItem = {
      id: 0,
      description: `${description} (${startStr}-${endStr}, ${remainingDays} gün kıst)`,
      total: proratedAmount,
      company: "",
      totalUsd: 0,
      totalEur: 0,
    };

    const plan: Partial<ContractPayment> = {
      id: generatePaymentId(),
      contractId: contract.id,
      payDate: startDate,
      total: proratedAmount,
      paid: false,
      invoiceNo: "",
      company: contract.company || "",
      brand: customer.name || contract.brand || "",
      taxNo: customer.taxNo || "",
      eInvoice: false,
      yearly: false,
      list: [listItem],
      ref: `${customer.id}-${generateShortId()}`,
      customerId: customer.id || "",
      companyId: customer.erpId || "",
      balance: 0,
      invoiceTotal: 0,
      block: false,
      contractNumber: contract.no || 0,
      internalFirm: contract.internalFirm || "",
      type: "prorated",
      proratedDays: remainingDays,
      proratedStartDate: startDate,
    };

    const created = await this.paymentModel.create(plan);

    this.logger.log(
      `Kist plan olusturuldu: ${contract.company}, ${remainingDays} gun, ${proratedAmount} TL`,
    );

    return created.toObject() as ContractPayment;
  }

  /**
   * Faturasi kesilmemis tum kist planlari dondurur.
   * Cron tarafindan fatura kesimi icin kullanilir.
   */
  async findUninvoicedProratedPlans(): Promise<ContractPayment[]> {
    return this.paymentModel
      .find({
        type: "prorated",
        $or: [{ invoiceNo: "" }, { invoiceNo: { $exists: false } }],
      })
      .sort({ payDate: 1 })
      .lean()
      .exec();
  }

  /**
   * Tum kist planlarini filtreli olarak dondurur (rapor icin).
   */
  async findAllProratedPlans(filter?: {
    paid?: boolean;
    invoiced?: boolean;
    contractId?: string;
  }): Promise<ContractPayment[]> {
    const query: Record<string, unknown> = { type: "prorated" };

    if (filter?.paid !== undefined) {
      query.paid = filter.paid;
    }

    if (filter?.invoiced === true) {
      query.invoiceNo = { $nin: ["", null] };
    } else if (filter?.invoiced === false) {
      query.$or = [{ invoiceNo: "" }, { invoiceNo: { $exists: false } }];
    }

    if (filter?.contractId) {
      query.contractId = filter.contractId;
    }

    return this.paymentModel
      .find(query)
      .sort({ proratedStartDate: -1 })
      .lean()
      .exec();
  }

  /**
   * Aydaki gun sayisini hesaplar (UTC bazli).
   */
  private getDaysInMonth(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }

  /**
   * Tarihi "GG.AA" formatinda dondurur.
   */
  private formatDateShort(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(value.toFixed(2));
  }

  /**
   * Ilgili ayin regular plani faturalanmis mi kontrol eder.
   * Faturalanmissa true, faturalanmamissa false dondurur.
   */
  private async isMonthAlreadyInvoiced(
    contractId: string,
    date: Date,
  ): Promise<boolean> {
    const monthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
    );

    const invoicedPlan = await this.paymentModel
      .findOne({
        contractId,
        payDate: { $gte: monthStart, $lt: monthEnd },
        $or: [{ type: "regular" }, { type: { $exists: false } }],
        invoiceNo: { $nin: ["", null] },
      })
      .lean()
      .exec();

    return !!invoicedPlan;
  }

  /**
   * Musteri arar: customerId ile tek $or sorgusu kullanir.
   */
  private async findCustomer(customerId: string): Promise<Customer | null> {
    const orConditions: Array<Record<string, string>> = [
      { id: customerId },
      { erpId: customerId },
    ];

    if (isValidObjectId(customerId)) {
      orConditions.unshift({ _id: customerId });
    }

    return this.customerModel
      .findOne({ $or: orConditions })
      .lean()
      .exec();
  }
}
