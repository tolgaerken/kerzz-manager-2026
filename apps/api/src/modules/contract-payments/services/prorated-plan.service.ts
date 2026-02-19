import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
import { safeRound } from "../utils/math.utils";
import { findCustomerByAnyId } from "../utils/customer-lookup.utils";

/** Kist plan olusturmak icin gereken kalem bilgisi */
export interface ProratedItemInput {
  price: number;
  currency: string;
  startDate: Date;
  qty?: number;
  sourceItemId: string; // Kalemi olusturan kalemin id'si (silme icin gerekli)
}

/** Kist plan olusturma opsiyonlari */
export interface ProratedPlanOptions {
  /**
   * true ise gun hesabi yapilmaz, tam aylik ucret alinir.
   * Yazarkasa (EFT-POS) icin kullanilir - 1 gunde olsa 28 gunde olsa tam ucret.
   */
  skipDayCalculation?: boolean;
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
   * Eger ilgili ayin regular plani henuz olusturulmamissa, kist plan olusturmaz
   * ve null dondurur. Bu durumda regular plan olusturulurken bu kalem de dahil edilecektir.
   *
   * @param options.skipDayCalculation - true ise gun hesabi yapilmaz (yazarkasa icin)
   */
  async createProratedPlan(
    contractId: string,
    item: ProratedItemInput,
    description: string,
    options?: ProratedPlanOptions,
  ): Promise<ContractPayment | null> {
    const contract = await this.contractModel
      .findOne({ id: contractId })
      .lean()
      .exec();

    if (!contract) {
      throw new NotFoundException(`Kontrat bulunamadi: ${contractId}`);
    }

    // Is kurali: yillik kontratlarda kist plan hic olusturulmaz
    if (contract.yearly) {
      this.logger.log(
        `Kist plan atlaniyor: ${contractId} - yillik kontrat`,
      );
      return null;
    }

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

    const customer = await findCustomerByAnyId(this.customerModel, contract.customerId);
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
    const monthlyPrice = safeRound(rawPrice * rate);

    // Tutar hesapla: skipDayCalculation true ise tam aylik, degilse kist
    const skipDayCalc = options?.skipDayCalculation ?? false;
    let proratedAmount: number;
    let descriptionText: string;
    let effectiveDays: number;

    if (skipDayCalc) {
      // Gun hesabi yapilmaz - tam aylik ucret (yazarkasa icin)
      proratedAmount = monthlyPrice;
      descriptionText = `${description} (tam ay)`;
      effectiveDays = daysInMonth;
    } else {
      // Normal kist hesabi
      const dailyRate = monthlyPrice / daysInMonth;
      proratedAmount = safeRound(dailyRate * remainingDays);
      const startStr = this.formatDateShort(startDate);
      const endStr = this.formatDateShort(monthEnd);
      descriptionText = `${description} (${startStr}-${endStr}, ${remainingDays} gün kıst)`;
      effectiveDays = remainingDays;
    }

    const listItem: PaymentListItem = {
      id: 0,
      description: descriptionText,
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
      proratedDays: effectiveDays,
      proratedStartDate: startDate,
      sourceItemId: item.sourceItemId,
    };

    const created = await this.paymentModel.create(plan);

    const logSuffix = skipDayCalc ? "(gun hesabi atlanildi)" : "";
    this.logger.log(
      `Kist plan olusturuldu: ${contract.company}, ${effectiveDays} gun, ${proratedAmount} TL ${logSuffix}`,
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

  async findUninvoicedProratedPlanById(
    planId: string,
  ): Promise<ContractPayment | null> {
    return this.paymentModel
      .findOne({
        id: planId,
        type: "prorated",
        $or: [{ invoiceNo: "" }, { invoiceNo: { $exists: false } }],
      })
      .lean()
      .exec();
  }

  /**
   * Belirli bir kaynak kaleme ait faturasi kesilmemis kist planlari siler.
   * Kalem silindiginde cagrilir.
   */
  async deleteUninvoicedBySourceItem(
    contractId: string,
    sourceItemId: string,
  ): Promise<number> {
    const result = await this.paymentModel
      .deleteMany({
        contractId,
        sourceItemId,
        type: "prorated",
        $or: [{ invoiceNo: "" }, { invoiceNo: { $exists: false } }],
      })
      .exec();

    if (result.deletedCount > 0) {
      this.logger.log(
        `Kist plan silindi: contractId=${contractId}, sourceItemId=${sourceItemId}, silinen=${result.deletedCount}`,
      );
    }

    return result.deletedCount;
  }

  /**
   * Belirli bir kıst planı ID ile siler.
   * Sadece faturası kesilmemiş kıst kayıtlar silinebilir.
   */
  async deleteProratedPlanById(planId: string): Promise<{ id: string; deleted: true }> {
    const plan = await this.paymentModel
      .findOne({ id: planId, type: "prorated" })
      .lean()
      .exec();

    if (!plan) {
      throw new NotFoundException(`Kıst plan bulunamadı: ${planId}`);
    }

    const hasInvoiceNo =
      typeof plan.invoiceNo === "string" && plan.invoiceNo.trim().length > 0;
    if (hasInvoiceNo) {
      throw new BadRequestException(
        "Faturalanmış kıst kaydı rapordan çıkarılamaz.",
      );
    }

    await this.paymentModel
      .deleteOne({
        id: planId,
        type: "prorated",
        $or: [{ invoiceNo: "" }, { invoiceNo: { $exists: false } }],
      })
      .exec();

    this.logger.log(`Kıst plan silindi: id=${planId}`);
    return { id: planId, deleted: true };
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

  /**
   * Ilgili ayin regular plani faturalanmis mi kontrol eder.
   *
   * NOT: Eski sistemde payDate degerleri ayin son gunu 21:00 UTC olarak
   * kaydedilmis (TR saatiyle bir sonraki ayin 1'i 00:00).
   * Ornegin Subat faturasi payDate=2026-01-31T21:00:00.000Z seklinde.
   * Bu nedenle aralik onceki ayin son gunu 21:00 UTC'den baslar.
   */
  private async isMonthAlreadyInvoiced(
    contractId: string,
    date: Date,
  ): Promise<boolean> {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    // Eski format: payDate = onceki ayin son gunu 21:00 UTC (TR 00:00)
    // Yeni format: payDate = ayin 1'i 00:00 UTC
    // Her iki formati da yakalamak icin genis aralik kullan
    const prevMonthLastDay21 = new Date(Date.UTC(year, month, 0, 21, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month + 1, 1));

    const invoicedPlan = await this.paymentModel
      .findOne({
        contractId,
        payDate: { $gte: prevMonthLastDay21, $lt: monthEnd },
        $or: [{ type: "regular" }, { type: { $exists: false } }],
        invoiceNo: { $nin: ["", null] },
      })
      .lean()
      .exec();

    return !!invoicedPlan;
  }

}
