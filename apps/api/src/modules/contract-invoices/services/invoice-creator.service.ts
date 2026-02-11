import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { addDays, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../../contract-payments/schemas/contract-payment.schema";
import { Invoice, InvoiceDocument } from "../../invoices/schemas/invoice.schema";
import { Customer } from "../../customers/schemas/customer.schema";
import { Contract } from "../../contracts/schemas/contract.schema";
import { CompaniesService } from "../../companies";
import { InvoiceMapperService } from "./invoice-mapper.service";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import type {
  CloudInvoice,
  CloudInvoiceRow,
  CloudInvoiceCover,
  CreateInvoiceResult,
} from "../interfaces";

const VAT_RATE = 20;
const VAT_RATE_DECIMAL = VAT_RATE / 100;
const VAT_RATE_MULTIPLIER = 1 + VAT_RATE_DECIMAL;
const CONTRACT_DUE_DAYS = 10;

@Injectable()
export class InvoiceCreatorService {
  private readonly logger = new Logger(InvoiceCreatorService.name);
  private readonly invoiceServiceUrl: string;
  private readonly invoiceServiceApiKey: string;

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
    @InjectModel(Invoice.name, CONTRACT_DB_CONNECTION)
    private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<Customer>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<Contract>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly companiesService: CompaniesService,
    private readonly invoiceMapperService: InvoiceMapperService,
  ) {
    this.invoiceServiceUrl =
      this.configService.get<string>("INVOICE_SERVICE_URL") ||
      "https://invoice-service.kerzz.com:4260";
    this.invoiceServiceApiKey =
      this.configService.get<string>("INVOICE_SERVICE_API_KEY") || "";
  }

  /**
   * Birden fazla odeme planindan fatura olusturur.
   * Her plan icin ayri ayri islem yapar, hata durumunda devam eder.
   */
  async createFromPaymentPlans(
    planIds: string[],
  ): Promise<CreateInvoiceResult[]> {
    const results: CreateInvoiceResult[] = [];

    for (const planId of planIds) {
      const result = await this.createSingleInvoice(planId);
      results.push(result);
    }

    return results;
  }

  /**
   * Tek bir odeme planindan fatura olusturur.
   * Fatura numarasi zaten varsa Cloudie API'ye gondermez, sadece global invoice kaydini gunceller.
   */
  private async createSingleInvoice(
    planId: string,
  ): Promise<CreateInvoiceResult> {
    try {
      const paymentPlan = await this.paymentModel
        .findOne({ id: planId })
        .lean()
        .exec();

      if (!paymentPlan) {
        return { planId, success: false, error: "Odeme plani bulunamadi" };
      }

      if (paymentPlan.total < 0) {
        return {
          planId,
          success: false,
          error: "Negatif tutarli fatura olusturulamaz",
        };
      }

      // Musteri ve kontrat bilgilerini cek
      const [customer, contract] = await Promise.all([
        this.customerModel
          .findOne({ id: paymentPlan.customerId })
          .lean()
          .exec(),
        this.contractModel
          .findOne({ id: paymentPlan.contractId })
          .lean()
          .exec(),
      ]);

      if (!customer || !contract) {
        return {
          planId,
          success: false,
          error: "Musteri veya kontrat bulunamadi",
        };
      }

      const hasExistingInvoice = !!paymentPlan.invoiceNo;

      // Fatura numarasi yoksa Cloudie API'ye gonder
      if (!hasExistingInvoice) {
        return this.createNewInvoice(
          planId,
          paymentPlan as ContractPayment,
          customer as Customer,
          contract as Contract,
        );
      }

      // Fatura numarasi varsa sadece global invoice kaydini guncelle
      return this.updateGlobalInvoiceOnly(
        planId,
        paymentPlan as ContractPayment,
        customer as Customer,
        contract as Contract,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      this.logger.error(
        `Fatura olusturma hatasi (plan: ${planId}): ${errorMessage}`,
      );

      // Hata bilgisini odeme planina yaz
      await this.paymentModel
        .updateOne({ id: planId }, { $set: { invoiceError: errorMessage } })
        .catch(() => {});

      return { planId, success: false, error: errorMessage };
    }
  }

  /**
   * Yeni fatura olusturur: Cloudie API'ye gonderir ve global invoice kaydini yapar.
   */
  private async createNewInvoice(
    planId: string,
    paymentPlan: ContractPayment,
    customer: Customer,
    contract: Contract,
  ): Promise<CreateInvoiceResult> {
    const company = await this.companiesService.findByIdc(
      contract.internalFirm,
    );

    const cloudInvoice = this.buildCloudInvoice(
      paymentPlan,
      customer,
      contract,
      company,
    );

    const invoiceCover: CloudInvoiceCover = {
      licanceId: company.cloudDb,
      invoice: cloudInvoice,
    };

    const sentInvoice = await this.sendToCloudieApi(invoiceCover);

    const now = new Date();
    const invoiceDate = now;
    const dueDate = addDays(invoiceDate, CONTRACT_DUE_DAYS);

    // Global invoice olustur (mapper'dan hesaplanan degerler)
    const globalInvoice = this.invoiceMapperService.mapPaymentPlanToInvoice(
      {
        ...paymentPlan,
        invoiceNo: sentInvoice.invoiceNumber,
        uuid: sentInvoice.uuid,
        invoiceDate,
        dueDate,
      } as ContractPayment,
      customer.erpId || "",
      contract.internalFirm || "",
    );

    // Cloudie API'den donen degerleri kontrol et
    const sentGrandTotal = this.safeRound(Number(sentInvoice.grandTotal ?? 0));
    const sentTaxTotal = this.safeRound(Number(sentInvoice.taxTotal ?? 0));
    const sentTotal = this.safeRound(sentGrandTotal - sentTaxTotal);

    // Fallback: Cloudie degerleri 0 ise mapper'in hesapladigi degerleri kullan
    const finalGrandTotal = sentGrandTotal > 0 ? sentGrandTotal : globalInvoice.grandTotal;
    const finalTaxTotal = sentTaxTotal > 0 ? sentTaxTotal : globalInvoice.taxTotal;
    const finalTotal = sentTotal > 0 ? sentTotal : globalInvoice.total;

    await this.paymentModel.updateOne(
      { id: planId },
      {
        $set: {
          invoiceNo: sentInvoice.invoiceNumber,
          uuid: sentInvoice.uuid,
          invoiceDate,
          invoiceTotal: finalGrandTotal,
          dueDate,
          invoiceError: "",
          editDate: now,
        },
      },
    );

    const invoiceDescription = `Kontrat Faturasi ${format(invoiceDate, "dd.MM.yyyy")}`;

    await this.invoiceModel.updateOne(
      { id: globalInvoice.id },
      {
        $set: {
          ...this.toPlainObject(globalInvoice),
          invoiceNumber: sentInvoice.invoiceNumber,
          invoiceUUID: sentInvoice.uuid,
          grandTotal: finalGrandTotal,
          taxTotal: finalTaxTotal,
          total: finalTotal,
          description: invoiceDescription,
        },
      },
      { upsert: true },
    );

    return {
      planId,
      success: true,
      invoiceNo: sentInvoice.invoiceNumber,
      uuid: sentInvoice.uuid,
    };
  }

  /**
   * Fatura numarasi olan odeme plani icin sadece global invoice kaydini gunceller.
   * Cloudie API'ye tekrar gonderim yapmaz.
   */
  private async updateGlobalInvoiceOnly(
    planId: string,
    paymentPlan: ContractPayment,
    customer: Customer,
    contract: Contract,
  ): Promise<CreateInvoiceResult> {
    const now = new Date();
    const invoiceDate = paymentPlan.invoiceDate
      ? new Date(paymentPlan.invoiceDate)
      : now;
    const dueDate = paymentPlan.dueDate
      ? new Date(paymentPlan.dueDate)
      : addDays(invoiceDate, CONTRACT_DUE_DAYS);

    const globalInvoice = this.invoiceMapperService.mapPaymentPlanToInvoice(
      {
        ...paymentPlan,
        invoiceDate,
        dueDate,
      } as ContractPayment,
      customer.erpId || "",
      contract.internalFirm || "",
    );

    const invoiceDescription = `Kontrat Faturasi ${format(invoiceDate, "dd.MM.yyyy")}`;

    await this.invoiceModel.updateOne(
      { id: globalInvoice.id },
      {
        $set: {
          ...this.toPlainObject(globalInvoice),
          grandTotal: globalInvoice.grandTotal,
          taxTotal: globalInvoice.taxTotal,
          total: globalInvoice.total,
          description: invoiceDescription,
        },
      },
      { upsert: true },
    );

    this.logger.log(
      `Fatura no mevcut (${paymentPlan.invoiceNo}), sadece global invoice guncellendi (plan: ${planId})`,
    );

    return {
      planId,
      success: true,
      invoiceNo: paymentPlan.invoiceNo,
      uuid: paymentPlan.uuid,
    };
  }

  /**
   * Cloudie API'sine fatura gonderir.
   */
  private async sendToCloudieApi(
    invoiceCover: CloudInvoiceCover,
  ): Promise<CloudInvoice> {
    const url = `${this.invoiceServiceUrl}/api/invoice/saveinvoicewithobject`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<CloudInvoice>(url, invoiceCover, {
          headers: {
            "x-api-key": this.invoiceServiceApiKey,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }),
      );

      return data;
    } catch (error: unknown) {
      // Axios hata detaylarini logla ve ilet
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown };
          message?: string;
        };
        const responseData = axiosError.response?.data;
        const status = axiosError.response?.status;

        this.logger.error(
          `Cloudie API hatasi (${status}): ${JSON.stringify(responseData)}`,
        );

        // Detayli hata mesajini ilet
        const errorDetail =
          typeof responseData === "object" && responseData !== null
            ? JSON.stringify(responseData)
            : String(responseData || axiosError.message);

        throw new Error(`Fatura servisi hatasi (${status}): ${errorDetail}`);
      }
      throw error;
    }
  }

  /**
   * Odeme planindaki verilerden Cloud fatura nesnesi olusturur.
   */
  private buildCloudInvoice(
    paymentPlan: ContractPayment,
    customer: Customer,
    contract: Contract,
    company: { cloudDb: string; noVat?: boolean; exemptionReason?: string },
  ): CloudInvoice {
    const invoiceRows = this.buildCloudInvoiceRows(
      paymentPlan.list || [],
      contract.noVat,
    );

    const taxTotal = contract.noVat
      ? 0
      : invoiceRows.reduce((sum, r) => sum + r.taxTotal, 0);
    const grandTotal = invoiceRows.reduce((sum, r) => sum + r.grandTotal, 0);

    const dueDate = addDays(new Date(), CONTRACT_DUE_DAYS);
    const description = this.buildInvoiceDescription(
      paymentPlan,
      dueDate,
      contract.noVat,
      company.exemptionReason,
    );

    return {
      _id: "",
      account: {
        accountName: customer.name || "",
        taxNumber: customer.taxNo || "",
        taxOffice: customer.taxOffice || "",
        mail: customer.email || "",
        city: customer.address?.city || "",
        town: customer.address?.town || customer.address?.district || "",
        address: customer.address?.address || "",
      },
      branchCode: company.cloudDb,
      branchName: company.cloudDb,
      description,
      direction: "outBound",
      discountTotal: 0,
      documentType: "eInvoice",
      erp: "new",
      grandTotal,
      id: uuidv4(),
      invoiceDate: new Date().toISOString(),
      invoiceNumber: paymentPlan.invoiceNo || "",
      invoiceRows,
      invoiceType: contract.noVat ? "exemptions" : "sale",
      payRows: [],
      reference: paymentPlan.id,
      source: "pos",
      status: "standby",
      stoppageAmount: 0,
      stoppageRate: "",
      stoppageReason: "",
      exemptionReason: contract.noVat ? (company.exemptionReason || "") : "",
      taxTotal,
      typeScenario: "base",
      uuid: paymentPlan.uuid || "",
      contacts: [],
    };
  }

  /**
   * Odeme plani satirlarini Cloudie formatina donusturur.
   */
  private buildCloudInvoiceRows(
    list: Array<{
      id: number;
      description: string;
      total: number;
      company: string;
      totalUsd: number;
      totalEur: number;
    }>,
    noVat: boolean,
  ): CloudInvoiceRow[] {
    return list.map((item) => {
      const total = item.total || 0;
      const taxTotal = noVat ? 0 : this.safeRound(total * VAT_RATE_DECIMAL);
      const grandTotal = noVat ? total : this.safeRound(total * VAT_RATE_MULTIPLIER);

      return {
        id: uuidv4(),
        code: "",
        name: item.description || "",
        description: item.description || "",
        quantity: 1,
        unitPrice: total,
        discount: 0,
        taxRate: noVat ? 0 : VAT_RATE,
        taxTotal,
        total,
        grandTotal,
        stoppageAmount: 0,
        unitName: "AD",
      };
    });
  }

  /**
   * Fatura aciklama metni olusturur.
   */
  private buildInvoiceDescription(
    paymentPlan: ContractPayment,
    dueDate: Date,
    noVat: boolean,
    exemptionReason?: string,
  ): string {
    const dueDateStr = format(dueDate, "dd.MM.yyyy");
    const exemptionDesc =
      noVat && exemptionReason ? exemptionReason : "";

    return `<br>
      <b>SON ODEME TARIHI : ${dueDateStr}</b>, Son odeme tarihinde odenmeyen faturalar icin <b>sozlesmede belirtilen oranda gecikme bedeli yansitilir.</b><br>
      Bu faturanin detaylarini https://fatura.kerzz.com adresinden ${paymentPlan.ref || ""} kodu gorebilirsiniz.${exemptionDesc}`;
  }

  /**
   * Mongoose document'i duz objeye cevirir.
   */
  private toPlainObject(doc: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(doc));
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(value.toFixed(2));
  }
}
