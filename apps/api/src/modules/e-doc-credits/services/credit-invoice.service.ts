import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { EDocCreditsService } from "../e-doc-credits.service";
import { CustomersService } from "../../customers/customers.service";
import { CompaniesService } from "../../companies/companies.service";
import { InvoicesService } from "../../invoices/invoices.service";
import { EInvoiceService } from "./e-invoice.service";

import {
  EInvoiceClass,
  EInvoiceCover,
  EInvoiceRow,
  CreditInvoiceResult,
} from "../interfaces/e-invoice.interfaces";
import { E_INVOICE_CONSTANTS } from "../constants/e-invoice.constants";

/**
 * Kredi kaydından fatura oluşturma servisi
 * io-cloud-2025'teki EDocMontlyInvoiceService.createCloudInvoiceFromEDocTransaction()
 * ve createGlobalInvoice() muadili
 */
@Injectable()
export class CreditInvoiceService {
  private readonly logger = new Logger(CreditInvoiceService.name);

  constructor(
    private readonly eDocCreditsService: EDocCreditsService,
    private readonly customersService: CustomersService,
    private readonly companiesService: CompaniesService,
    private readonly invoicesService: InvoicesService,
    private readonly eInvoiceService: EInvoiceService,
  ) {}

  /**
   * Kredi kaydından fatura oluşturur
   * 1. Kredi, müşteri ve firma bilgilerini alır
   * 2. EInvoiceClass nesnesi oluşturur
   * 3. Harici API'ye gönderir
   * 4. Global invoice kaydı oluşturur
   * 5. Kredi kaydını günceller
   */
  async createInvoiceForCredit(creditId: string): Promise<CreditInvoiceResult> {
    this.logger.log(`Kredi kaydı için fatura oluşturuluyor: ${creditId}`);

    // 1. Kredi kaydını al
    const credit = await this.eDocCreditsService.findOne(creditId);
    if (!credit) {
      throw new NotFoundException(`Kredi kaydı bulunamadı: ${creditId}`);
    }

    // Fatura zaten oluşturulmuşsa uyarı ver
    if (credit.invoiceNumber && credit.invoiceNumber.trim() !== "") {
      this.logger.warn(
        `Bu kredi kaydı için zaten fatura oluşturulmuş: ${credit.invoiceNumber}`,
      );
    }

    // 2. Müşteri bilgilerini al
    const customer = await this.findCustomer(credit.customerId, credit.erpId);

    // 3. Firma bilgilerini al (internalFirm -> idc veya id ile eşle)
    const company = await this.findCompany(credit.internalFirm);

    // 4. Toplam hesaplamaları
    const qty = credit.count;
    const unitPrice = credit.price;
    const calculatedTotal = qty * unitPrice;
    const actualTotal = credit.total || calculatedTotal;

    // Birim fiyat düzeltmesi (io-cloud-2025 ile aynı mantık)
    let correctedUnitPrice = unitPrice;
    if (Math.abs(actualTotal - calculatedTotal) > 0.01) {
      correctedUnitPrice = actualTotal / qty;
      this.logger.warn(
        `Birim fiyat düzeltildi: ${unitPrice} -> ${correctedUnitPrice}`,
      );
    }

    // İskonto hesaplama
    const discount = qty * correctedUnitPrice - actualTotal;

    // KDV hesaplama (firma noVat ise %0)
    const vatRate = company.noVat
      ? 0
      : E_INVOICE_CONSTANTS.DEFAULT_VAT_RATE;
    const vatRateDecimal = company.noVat
      ? 0
      : E_INVOICE_CONSTANTS.DEFAULT_VAT_RATE_DECIMAL;

    const total = actualTotal;
    const taxTotal = total * vatRateDecimal;
    const grandTotal = total + taxTotal;

    // Vade tarihi
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + E_INVOICE_CONSTANTS.EDOC_DUE_DAYS);

    // 5. EInvoiceClass oluştur
    const invoice = this.buildInvoice({
      customer,
      company,
      credit,
      correctedUnitPrice,
      qty,
      total,
      taxTotal,
      grandTotal,
      discount,
      vatRate,
      dueDate,
    });

    // 6. Harici API'ye gönder
    const licanceId = company.cloudDb;
    const invoiceCover: EInvoiceCover = {
      licanceId,
      invoice,
    };

    const returnedInvoice = await this.eInvoiceService.sendInvoice(invoiceCover);

    // 7. Global invoice kaydı oluştur
    // creatorId 'system' ise fatura ödendi olarak işaretlenir
    console.log(">>> CREDIT DATA:", JSON.stringify(credit, null, 2));
    console.log(">>> creatorId:", credit.creatorId, "| isSystem:", credit.creatorId === "system");
    const isSystemCredit = credit.creatorId === "system";
  
    await this.createGlobalInvoice({
      credit,
      customer,
      company,
      returnedInvoice,
      total,
      taxTotal,
      grandTotal,
      dueDate,
      correctedUnitPrice,
      qty,
      discount,
      vatRate,
      isPaid: isSystemCredit,
    });

    // 8. Kredi kaydını fatura bilgileriyle güncelle
    await this.eDocCreditsService.update(creditId, {
      price: correctedUnitPrice,
      invoiceNumber: returnedInvoice.invoiceNumber,
      invoiceUUID: returnedInvoice.uuid,
      invoiceDate: new Date().toISOString(),
      grandTotal,
      taxTotal,
    });

    const result: CreditInvoiceResult = {
      invoiceNumber: returnedInvoice.invoiceNumber,
      invoiceUUID: returnedInvoice.uuid,
      invoiceDate: new Date(),
      grandTotal,
      taxTotal,
      total,
    };

    this.logger.log(
      `Fatura başarıyla oluşturuldu: ${result.invoiceNumber} (${credit.erpId})`,
    );

    return result;
  }

  /**
   * Müşteriyi bulur: önce customerId, bulamazsa erpId ile arar
   */
  private async findCustomer(customerId: string, erpId: string) {
    try {
      if (customerId) {
        return await this.customersService.findByAnyId(customerId);
      }
    } catch {
      // customerId ile bulunamazsa erpId ile dene
    }

    if (erpId) {
      try {
        return await this.customersService.findByAnyId(erpId);
      } catch {
        // erpId ile de bulunamadı
      }
    }

    throw new NotFoundException(
      `Müşteri bulunamadı. customerId: ${customerId}, erpId: ${erpId}`,
    );
  }

  /**
   * Müşteri adres alanını çözümler
   * Adres string veya nesne ({address, city, town}) olabilir
   */
  private resolveAddress(customer: any): string {
    if (!customer.address) return "";
    if (typeof customer.address === "string") return customer.address;
    if (typeof customer.address === "object") {
      return String(customer.address.address || customer.address.text || "");
    }
    return String(customer.address);
  }

  /**
   * Firmayı bulur: internalFirm değerini idc veya id ile eşler
   */
  private async findCompany(internalFirm: string) {
    if (!internalFirm) {
      throw new BadRequestException("Firma bilgisi (internalFirm) zorunludur");
    }

    try {
      return await this.companiesService.findByIdc(internalFirm);
    } catch {
      // idc ile bulunamazsa id ile dene
    }

    try {
      return await this.companiesService.findById(internalFirm);
    } catch {
      throw new NotFoundException(`Firma bulunamadı: ${internalFirm}`);
    }
  }

  /**
   * E-fatura nesnesini oluşturur (io-cloud-2025 mantığı)
   */
  private buildInvoice(params: {
    customer: any;
    company: any;
    credit: any;
    correctedUnitPrice: number;
    qty: number;
    total: number;
    taxTotal: number;
    grandTotal: number;
    discount: number;
    vatRate: number;
    dueDate: Date;
  }): EInvoiceClass {
    const {
      customer,
      company,
      credit,
      correctedUnitPrice,
      qty,
      total,
      taxTotal,
      grandTotal,
      discount,
      vatRate,
      dueDate,
    } = params;

    const itemDescription = "E-Dönüşüm Kontör";

    const dueDateStr = dueDate.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const description = `<br>
          <b>SON ÖDEME TARİHİ : ${dueDateStr}</b>, Son ödeme tarihinde ödenmeyen faturalar için <b>sözleşmede belirtilen oranda gecikme bedeli yansıtılır.</b><br>
          ${company.description || ""}`;

    const invoiceRowId = uuidv4();

    const invoiceRow: EInvoiceRow = {
      id: invoiceRowId,
      itemId: "",
      description: "",
      qty,
      unitPrice: correctedUnitPrice,
      total,
      code: E_INVOICE_CONSTANTS.INVOICE_ITEM_CODE,
      discount,
      grandTotal,
      name: itemDescription,
      quantity: qty,
      stoppageAmount: 0,
      taxRate: vatRate,
      taxTotal,
      unitName: E_INVOICE_CONSTANTS.INVOICE_UNIT_NAME,
    };

    const invoice: EInvoiceClass = {
      _id: "",
      folio: {
        ecrSerial: "",
        ecrZReportNo: "",
        folioNo: "",
        folioRowNo: 0,
        folioNote: "",
      },
      account: {
        accountName: String(customer.name || customer.companyName || ""),
        address: this.resolveAddress(customer),
        city: String(customer.city || ""),
        town: String(customer.district || ""),
        mail: String(customer.email || ""),
        taxNumber: String(customer.taxNo || ""),
        taxOffice: String(customer.taxOffice || ""),
      },
      branchCode: company.cloudDb,
      branchName: company.cloudDb,
      description,
      direction: "outBound",
      discountTotal: 0,
      documentType: "eInvoice",
      erp: credit.erpId,
      grandTotal,
      id: "",
      invoiceDate: new Date().toISOString(),
      invoiceNumber: "",
      invoiceRows: [invoiceRow],
      invoiceType: "sale",
      payRows: [],
      reference: credit.id,
      source: "pos",
      status: "standby",
      stoppageAmount: 0,
      stoppageRate: "",
      stoppageReason: "",
      taxTotal,
      typeScenario: "base",
      uuid: "",
      contacts: [],
    };

    return invoice;
  }

  /**
   * Global invoice (lokal) kaydını oluşturur
   */
  private async createGlobalInvoice(params: {
    credit: any;
    customer: any;
    company: any;
    returnedInvoice: EInvoiceClass;
    total: number;
    taxTotal: number;
    grandTotal: number;
    dueDate: Date;
    correctedUnitPrice: number;
    qty: number;
    discount: number;
    vatRate: number;
    isPaid: boolean;
  }): Promise<void> {
    const {
      credit,
      customer,
      company,
      returnedInvoice,
      total,
      taxTotal,
      grandTotal,
      dueDate,
      correctedUnitPrice,
      qty,
      discount,
      vatRate,
      isPaid,
    } = params;

    const invoiceRows = [
      {
        id: uuidv4(),
        code: E_INVOICE_CONSTANTS.INVOICE_ITEM_CODE,
        name: "E-Dönüşüm Kontör",
        description: "",
        quantity: qty,
        unitPrice: correctedUnitPrice,
        discount,
        taxRate: vatRate,
        taxTotal,
        total,
        grandTotal,
        stoppageAmount: 0,
      },
    ];

    await this.invoicesService.create({
      contractId: "",
      customerId: customer._id,
      name: customer.name || customer.companyName || "",
      description: "E-Dönüşüm Kontör Faturası",
      dueDate,
      eCreditId: credit.id,
      erpId: credit.erpId,
      grandTotal,
      invoiceDate: new Date(),
      invoiceNumber: returnedInvoice.invoiceNumber,
      invoiceRows,
      invoiceType: "eDocuments",
      invoiceUUID: returnedInvoice.uuid,
      taxTotal,
      total,
      internalFirm: company.idc || credit.internalFirm,
      reference: returnedInvoice.reference || credit.id,
      isPaid,
      paymentSuccessDate: isPaid ? new Date() : undefined,
    });

    this.logger.log(
      `Global invoice kaydı oluşturuldu: ${returnedInvoice.invoiceNumber}`,
    );
  }
}
