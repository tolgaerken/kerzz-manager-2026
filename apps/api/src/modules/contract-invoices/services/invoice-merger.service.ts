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
  PaymentListItem,
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

/** Gruplama icin kullanilan anahtar */
interface GroupKey {
  customerId: string;
  payDateMonth: string; // YYYY-MM
  internalFirm: string;
}

/** Gruplandırılmış planlar */
interface PlanGroup {
  key: GroupKey;
  plans: ContractPayment[];
  customer: Customer;
  contract: Contract;
}

@Injectable()
export class InvoiceMergerService {
  private readonly logger = new Logger(InvoiceMergerService.name);
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
   * Ayni customerId + ayni ay icin olan planlari tek faturada birlestirir.
   */
  async createMergedInvoices(
    planIds: string[],
  ): Promise<CreateInvoiceResult[]> {
    const results: CreateInvoiceResult[] = [];

    // Planlari getir
    const plans = await this.paymentModel
      .find({ id: { $in: planIds } })
      .lean()
      .exec();

    if (plans.length === 0) {
      return [];
    }

    // Planlari grupla
    const groups = await this.groupPlans(plans as ContractPayment[]);

    // Her grup icin fatura olustur
    for (const group of groups) {
      try {
        if (group.plans.length === 1) {
          // Tek plan - normal akis
          const result = await this.createSingleInvoice(
            group.plans[0],
            group.customer,
            group.contract,
          );
          results.push(result);
        } else {
          // Birden fazla plan - birlestir
          const result = await this.createMergedInvoice(group);
          results.push(result);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        this.logger.error(
          `Grup fatura hatasi (customer: ${group.key.customerId}): ${errorMessage}`,
        );

        // Gruptaki tum planlar icin hata sonucu ekle
        for (const plan of group.plans) {
          results.push({
            planId: plan.id,
            success: false,
            error: errorMessage,
          });

          // Hata bilgisini plana yaz
          await this.paymentModel
            .updateOne({ id: plan.id }, { $set: { invoiceError: errorMessage } })
            .catch(() => {});
        }
      }
    }

    return results;
  }

  /**
   * Planlari customerId + payDate ayi + internalFirm bazinda gruplar.
   */
  private async groupPlans(plans: ContractPayment[]): Promise<PlanGroup[]> {
    const groupMap = new Map<string, ContractPayment[]>();

    // Planlari grupla
    for (const plan of plans) {
      const payDateMonth = this.getPayDateMonth(plan.payDate);
      const key = `${plan.customerId}|${payDateMonth}|${plan.internalFirm || ""}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(plan);
    }

    // Gruplari PlanGroup formatina donustur
    const groups: PlanGroup[] = [];

    for (const [keyStr, groupPlans] of groupMap) {
      const [customerId, payDateMonth, internalFirm] = keyStr.split("|");

      // Musteri ve kontrat bilgilerini getir (ilk plandan)
      const firstPlan = groupPlans[0];
      const [customer, contract] = await Promise.all([
        this.customerModel.findOne({ id: customerId }).lean().exec(),
        this.contractModel.findOne({ id: firstPlan.contractId }).lean().exec(),
      ]);

      if (!customer || !contract) {
        this.logger.warn(
          `Musteri veya kontrat bulunamadi: customerId=${customerId}, contractId=${firstPlan.contractId}`,
        );
        continue;
      }

      groups.push({
        key: { customerId, payDateMonth, internalFirm },
        plans: groupPlans,
        customer: customer as Customer,
        contract: contract as Contract,
      });
    }

    return groups;
  }

  /**
   * Tek bir plan icin fatura olusturur.
   */
  private async createSingleInvoice(
    plan: ContractPayment,
    customer: Customer,
    contract: Contract,
  ): Promise<CreateInvoiceResult> {
    // Fatura numarasi varsa sadece global invoice guncelle
    if (plan.invoiceNo) {
      return this.updateGlobalInvoiceOnly(plan, customer, contract);
    }

    // Negatif tutar kontrolu
    if (plan.total < 0) {
      return {
        planId: plan.id,
        success: false,
        error: "Negatif tutarli fatura olusturulamaz",
      };
    }

    const company = await this.companiesService.findByIdc(contract.internalFirm);

    const cloudInvoice = this.buildCloudInvoice(
      plan.list || [],
      plan.total,
      plan.ref || "",
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

    // Cloudie API'den donen degerleri kontrol et
    const sentGrandTotal = this.safeRound(Number(sentInvoice.grandTotal ?? 0));
    const sentTaxTotal = this.safeRound(Number(sentInvoice.taxTotal ?? 0));
    const sentTotal = this.safeRound(sentGrandTotal - sentTaxTotal);

    // Hesaplanan degerler
    const calculatedTotal = plan.total;
    const calculatedTaxTotal = this.safeRound(calculatedTotal * VAT_RATE_DECIMAL);
    const calculatedGrandTotal = this.safeRound(calculatedTotal + calculatedTaxTotal);

    // Fallback: Cloudie degerleri 0 ise hesaplanan degerleri kullan
    const finalGrandTotal = sentGrandTotal > 0 ? sentGrandTotal : calculatedGrandTotal;
    const finalTaxTotal = sentTaxTotal > 0 ? sentTaxTotal : calculatedTaxTotal;
    const finalTotal = sentTotal > 0 ? sentTotal : calculatedTotal;

    // Plan guncelle
    await this.paymentModel.updateOne(
      { id: plan.id },
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

    // Global invoice olustur
    const globalInvoice = this.invoiceMapperService.mapPaymentPlanToInvoice(
      {
        ...plan,
        invoiceNo: sentInvoice.invoiceNumber,
        uuid: sentInvoice.uuid,
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
      planId: plan.id,
      success: true,
      invoiceNo: sentInvoice.invoiceNumber,
      uuid: sentInvoice.uuid,
    };
  }

  /**
   * Birden fazla plani tek faturada birlestirir.
   */
  private async createMergedInvoice(group: PlanGroup): Promise<CreateInvoiceResult> {
    const { plans, customer, contract } = group;

    // Fatura numarasi olan planlari kontrol et
    const plansWithInvoice = plans.filter((p) => p.invoiceNo);
    if (plansWithInvoice.length > 0) {
      // Fatura numarasi olan planlar birlestirilemez
      return {
        planId: plans[0].id,
        success: false,
        error: `${plansWithInvoice.length} plan zaten faturalanmis, birlestirilemez`,
        mergedPlanIds: plans.map((p) => p.id),
      };
    }

    // Negatif tutar kontrolu
    const totalAmount = plans.reduce((sum, p) => sum + (p.total || 0), 0);
    if (totalAmount < 0) {
      return {
        planId: plans[0].id,
        success: false,
        error: "Negatif tutarli fatura olusturulamaz",
        mergedPlanIds: plans.map((p) => p.id),
      };
    }

    // Tum planlarin list'lerini birlestir
    const mergedList: PaymentListItem[] = [];
    for (const plan of plans) {
      if (plan.list && plan.list.length > 0) {
        mergedList.push(...plan.list);
      }
    }

    // Reference: tum plan ref'lerini birlestir
    const mergedRef = plans
      .map((p) => p.ref)
      .filter(Boolean)
      .join(", ");

    const company = await this.companiesService.findByIdc(contract.internalFirm);

    const cloudInvoice = this.buildCloudInvoice(
      mergedList,
      totalAmount,
      mergedRef,
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

    // Cloudie API'den donen degerleri kontrol et
    const sentGrandTotal = this.safeRound(Number(sentInvoice.grandTotal ?? 0));
    const sentTaxTotal = this.safeRound(Number(sentInvoice.taxTotal ?? 0));
    const sentTotal = this.safeRound(sentGrandTotal - sentTaxTotal);

    // Hesaplanan degerler
    const calculatedTaxTotal = this.safeRound(totalAmount * VAT_RATE_DECIMAL);
    const calculatedGrandTotal = this.safeRound(totalAmount + calculatedTaxTotal);

    // Fallback
    const finalGrandTotal = sentGrandTotal > 0 ? sentGrandTotal : calculatedGrandTotal;
    const finalTaxTotal = sentTaxTotal > 0 ? sentTaxTotal : calculatedTaxTotal;
    const finalTotal = sentTotal > 0 ? sentTotal : totalAmount;

    // Tum planlari guncelle
    const planIds = plans.map((p) => p.id);
    await this.paymentModel.updateMany(
      { id: { $in: planIds } },
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

    // Global invoice olustur (ilk planin id'si ile)
    const primaryPlan = plans[0];
    const globalInvoice = this.invoiceMapperService.mapMergedPlansToInvoice(
      plans,
      mergedList,
      totalAmount,
      customer.erpId || "",
      contract.internalFirm || "",
      sentInvoice.invoiceNumber,
      sentInvoice.uuid,
      invoiceDate,
      dueDate,
    );

    const invoiceDescription = `Kontrat Faturasi ${format(invoiceDate, "dd.MM.yyyy")} (${plans.length} plan birlestirildi)`;

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
          mergedPlanIds: planIds,
        },
      },
      { upsert: true },
    );

    this.logger.log(
      `Birlestirilmis fatura olusturuldu: ${plans.length} plan, toplam ${finalGrandTotal} TL, fatura no: ${sentInvoice.invoiceNumber}`,
    );

    return {
      planId: primaryPlan.id,
      success: true,
      invoiceNo: sentInvoice.invoiceNumber,
      uuid: sentInvoice.uuid,
      mergedPlanIds: planIds,
    };
  }

  /**
   * Fatura numarasi olan plan icin sadece global invoice gunceller.
   */
  private async updateGlobalInvoiceOnly(
    plan: ContractPayment,
    customer: Customer,
    contract: Contract,
  ): Promise<CreateInvoiceResult> {
    const now = new Date();
    const invoiceDate = plan.invoiceDate ? new Date(plan.invoiceDate) : now;
    const dueDate = plan.dueDate
      ? new Date(plan.dueDate)
      : addDays(invoiceDate, CONTRACT_DUE_DAYS);

    const globalInvoice = this.invoiceMapperService.mapPaymentPlanToInvoice(
      { ...plan, invoiceDate, dueDate } as ContractPayment,
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
      `Fatura no mevcut (${plan.invoiceNo}), sadece global invoice guncellendi (plan: ${plan.id})`,
    );

    return {
      planId: plan.id,
      success: true,
      invoiceNo: plan.invoiceNo,
      uuid: plan.uuid,
    };
  }

  /**
   * Cloud fatura nesnesi olusturur.
   */
  private buildCloudInvoice(
    list: PaymentListItem[],
    total: number,
    reference: string,
    customer: Customer,
    contract: Contract,
    company: { cloudDb: string; noVat?: boolean; exemptionReason?: string },
  ): CloudInvoice {
    const invoiceRows = this.buildCloudInvoiceRows(list, contract.noVat);

    const taxTotal = contract.noVat
      ? 0
      : invoiceRows.reduce((sum, r) => sum + r.taxTotal, 0);
    const grandTotal = invoiceRows.reduce((sum, r) => sum + r.grandTotal, 0);

    const dueDate = addDays(new Date(), CONTRACT_DUE_DAYS);
    const description = this.buildInvoiceDescription(
      reference,
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
      invoiceNumber: "",
      invoiceRows,
      invoiceType: contract.noVat ? "exemptions" : "sale",
      payRows: [],
      reference,
      source: "pos",
      status: "standby",
      stoppageAmount: 0,
      stoppageRate: "",
      stoppageReason: "",
      exemptionReason: contract.noVat ? (company.exemptionReason || "") : "",
      taxTotal,
      typeScenario: "base",
      uuid: "",
      contacts: [],
    };
  }

  /**
   * Fatura satirlarini Cloudie formatina donusturur.
   */
  private buildCloudInvoiceRows(
    list: PaymentListItem[],
    noVat: boolean,
  ): CloudInvoiceRow[] {
    return list.map((item) => {
      const total = item.total || 0;
      const taxTotal = noVat ? 0 : this.safeRound(total * VAT_RATE_DECIMAL);
      const grandTotal = noVat ? total : this.safeRound(total * VAT_RATE_MULTIPLIER);

      return {
        id: uuidv4(),
        code: item.itemId || "",
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
    reference: string,
    dueDate: Date,
    noVat: boolean,
    exemptionReason?: string,
  ): string {
    const dueDateStr = format(dueDate, "dd.MM.yyyy");
    const exemptionDesc = noVat && exemptionReason ? exemptionReason : "";

    return `<br>
      <b>SON ODEME TARIHI : ${dueDateStr}</b>, Son odeme tarihinde odenmeyen faturalar icin <b>sozlesmede belirtilen oranda gecikme bedeli yansitilir.</b><br>
      Bu faturanin detaylarini https://fatura.kerzz.com adresinden ${reference} kodu gorebilirsiniz.${exemptionDesc}`;
  }

  /**
   * Cloudie API'sine fatura gonderir.
   */
  private async sendToCloudieApi(invoiceCover: CloudInvoiceCover): Promise<CloudInvoice> {
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
   * PayDate'den ay bilgisini YYYY-MM formatinda alir.
   */
  private getPayDateMonth(payDate: Date | string): string {
    const date = new Date(payDate);
    return format(date, "yyyy-MM");
  }

  private toPlainObject(doc: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(doc));
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(value.toFixed(2));
  }
}
