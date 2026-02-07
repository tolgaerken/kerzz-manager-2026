/**
 * E-Fatura arayüz tanımları
 * io-cloud-2025 projesindeki TInvoiceClass, TInvoiceCover, TInvoiceRow yapılarının muadili
 */

export interface EInvoiceAccount {
  accountName: string;
  address: string;
  city: string;
  town: string;
  mail: string;
  taxNumber: string;
  taxOffice: string;
}

export interface EInvoiceFolio {
  ecrSerial: string;
  ecrZReportNo: string;
  folioNo: string;
  folioRowNo: number;
  folioNote: string;
}

export interface EInvoiceRow {
  id: string;
  itemId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  code: string;
  discount: number;
  grandTotal: number;
  name: string;
  quantity: number;
  stoppageAmount: number;
  taxRate: number;
  taxTotal: number;
  unitName: string;
}

export interface EInvoiceClass {
  _id: string;
  folio: EInvoiceFolio;
  account: EInvoiceAccount;
  branchCode: string;
  branchName: string;
  description: string;
  direction: string;
  discountTotal: number;
  documentType: string;
  erp: string;
  grandTotal: number;
  id: string;
  invoiceDate: string;
  invoiceNumber: string;
  invoiceRows: EInvoiceRow[];
  invoiceType: string;
  payRows: unknown[];
  reference: string;
  source: string;
  status: string;
  stoppageAmount: number;
  stoppageRate: string;
  stoppageReason: string;
  taxTotal: number;
  typeScenario: string;
  uuid: string;
  contacts: unknown[];
}

export interface EInvoiceCover {
  licanceId: string;
  invoice: EInvoiceClass;
}

export interface CreditInvoiceResult {
  invoiceNumber: string;
  invoiceUUID: string;
  invoiceDate: Date;
  grandTotal: number;
  taxTotal: number;
  total: number;
}
