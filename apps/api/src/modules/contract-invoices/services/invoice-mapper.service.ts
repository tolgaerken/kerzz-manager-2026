import { Injectable, Logger } from "@nestjs/common";
import {
  ContractPayment,
  PaymentListItem,
} from "../../contract-payments/schemas/contract-payment.schema";
import { Invoice } from "../../invoices/schemas/invoice.schema";
import { v4 as uuidv4 } from "uuid";

const VAT_RATE = 20;
const VAT_RATE_DECIMAL = VAT_RATE / 100;

@Injectable()
export class InvoiceMapperService {
  private readonly logger = new Logger(InvoiceMapperService.name);

  /**
   * ContractPayment -> Invoice (global-invoices) donusumu yapar.
   * Vergi hesaplama ve validasyon dahildir.
   */
  mapPaymentPlanToInvoice(
    paymentPlan: ContractPayment,
    erpId: string,
    internalFirm: string,
  ): Invoice {
    const invoiceRows = this.mapInvoiceRows(paymentPlan.list || []);
    const total = paymentPlan.total || 0;
    const taxTotal = this.safeRound(total * VAT_RATE_DECIMAL);
    const grandTotal = this.safeRound(total + taxTotal);

    const invoice = {
      id: paymentPlan.id,
      contractId: paymentPlan.contractId,
      customerId: paymentPlan.customerId || "",
      erpId: erpId || "",
      name: paymentPlan.company || "",
      description: "",
      invoiceType: "contract",
      invoiceDate: paymentPlan.invoiceDate,
      invoiceNumber: paymentPlan.invoiceNo || "",
      total,
      taxTotal,
      grandTotal,
      dueDate: paymentPlan.dueDate,
      payDate: paymentPlan.paymentDate,
      invoiceRows,
      saleId: "",
      eCreditId: "",
      lateFeeTotal: 0,
      lateFeeStatus: "",
      internalFirm: internalFirm || "",
      invoiceUUID: paymentPlan.uuid || "",
      isPaid: paymentPlan.paid || false,
      paymentSuccessDate: paymentPlan.payDate,
      reference: paymentPlan.ref || "",
    } as unknown as Invoice;

    this.validateInvoice(invoice);
    return invoice;
  }

  /**
   * Birden fazla ContractPayment'i tek Invoice'a donusturur.
   * Birlestirilmis faturalar icin kullanilir.
   */
  mapMergedPlansToInvoice(
    plans: ContractPayment[],
    mergedList: PaymentListItem[],
    totalAmount: number,
    erpId: string,
    internalFirm: string,
    invoiceNumber: string,
    invoiceUUID: string,
    invoiceDate: Date,
    dueDate: Date,
  ): Invoice {
    const invoiceRows = this.mapInvoiceRows(mergedList);
    const taxTotal = this.safeRound(totalAmount * VAT_RATE_DECIMAL);
    const grandTotal = this.safeRound(totalAmount + taxTotal);

    // Ilk plan ana plan olarak kullanilir
    const primaryPlan = plans[0];

    // Tum plan ref'lerini birlestir
    const mergedRef = plans
      .map((p) => p.ref)
      .filter(Boolean)
      .join(", ");

    // Tum plan id'lerini kaydet
    const mergedPlanIds = plans.map((p) => p.id);

    const invoice = {
      id: primaryPlan.id,
      contractId: primaryPlan.contractId,
      customerId: primaryPlan.customerId || "",
      erpId: erpId || "",
      name: primaryPlan.company || "",
      description: "",
      invoiceType: "contract",
      invoiceDate,
      invoiceNumber,
      total: totalAmount,
      taxTotal,
      grandTotal,
      dueDate,
      payDate: primaryPlan.paymentDate,
      invoiceRows,
      saleId: "",
      eCreditId: "",
      lateFeeTotal: 0,
      lateFeeStatus: "",
      internalFirm: internalFirm || "",
      invoiceUUID,
      isPaid: false,
      paymentSuccessDate: primaryPlan.payDate,
      reference: mergedRef,
      mergedPlanIds,
    } as unknown as Invoice;

    this.validateInvoice(invoice);
    return invoice;
  }

  /**
   * Odeme plani satirlarini fatura satirlarina donusturur.
   */
  private mapInvoiceRows(
    list: Array<{
      id: number;
      description: string;
      total: number;
      company: string;
      totalUsd: number;
      totalEur: number;
      itemId?: string;
    }>,
  ) {
    return list.map((row) => ({
      id: row.id?.toString() || this.generateId(),
      code: row.itemId || "",
      name: row.description || "",
      description: row.description || "",
      quantity: 1,
      unitPrice: row.total || 0,
      discount: 0,
      taxRate: VAT_RATE,
      taxTotal: this.safeRound((row.total || 0) * VAT_RATE_DECIMAL),
      total: row.total || 0,
      grandTotal: this.safeRound((row.total || 0) * (1 + VAT_RATE_DECIMAL)),
      stoppageAmount: 0,
    }));
  }

  /**
   * Fatura verisini validate eder.
   */
  private validateInvoice(invoice: Partial<Invoice>): void {
    if (!invoice.id || !invoice.customerId) {
      this.logger.warn("Fatura validasyonu basarisiz: Zorunlu alanlar eksik");
    }

    if (
      typeof invoice.total !== "number" ||
      typeof invoice.grandTotal !== "number"
    ) {
      this.logger.warn("Fatura validasyonu basarisiz: Gecersiz tutar");
    }

    if (
      !Array.isArray(invoice.invoiceRows) ||
      invoice.invoiceRows.length === 0
    ) {
      this.logger.warn("Fatura validasyonu basarisiz: Fatura satiri yok");
    }
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(value.toFixed(2));
  }

  private generateId(): string {
    return uuidv4().substring(0, 8);
  }
}
