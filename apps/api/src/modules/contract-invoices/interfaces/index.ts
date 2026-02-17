/** Cloudie fatura servisine gonderilecek fatura nesnesi */
export interface CloudInvoice {
  _id: string;
  folio?: {
    ecrSerial: string;
    ecrZReportNo: string;
    folioNo: string;
    folioRowNo: number;
    folioNote: string;
  };
  account: {
    accountName: string;
    taxNumber: string;
    taxOffice: string;
    mail: string;
    city: string;
    town: string;
    address: string;
  };
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
  invoiceRows: CloudInvoiceRow[];
  invoiceType: string;
  payRows: unknown[];
  reference: string;
  source: string;
  status: string;
  stoppageAmount: number;
  stoppageRate: string;
  stoppageReason: string;
  exemptionReason?: string;
  taxTotal: number;
  typeScenario: string;
  uuid: string;
  contacts: unknown[];
}

/** Cloudie fatura satir kalemi */
export interface CloudInvoiceRow {
  id: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  grandTotal: number;
  stoppageAmount: number;
  unitName: string;
}

/** Cloudie API'ye gonderilecek fatura kapak nesnesi */
export interface CloudInvoiceCover {
  licanceId: string;
  invoice: CloudInvoice;
}

/** Fatura olusturma sonucu (tek plan icin) */
export interface CreateInvoiceResult {
  planId: string;
  success: boolean;
  invoiceNo?: string;
  uuid?: string;
  error?: string;
  /** Birlestirilmis faturalarda dahil edilen plan ID'leri */
  mergedPlanIds?: string[];
}

/** Zenginlestirilmis odeme plani (balance, block bilgisiyle) */
export interface EnrichedPaymentPlan {
  _id: string;
  id: string;
  type: "regular" | "prorated";
  contractId: string;
  company: string;
  brand: string;
  customerId: string;
  licanceId: string;
  invoiceNo: string;
  paid: boolean;
  payDate: Date;
  paymentDate: Date;
  invoiceDate: Date;
  total: number;
  invoiceTotal: number;
  balance: number;
  list: PaymentListItemView[];
  yearly: boolean;
  eInvoice: boolean;
  uuid: string;
  ref: string;
  taxNo: string;
  internalFirm: string;
  contractNumber: number;
  segment: string;
  block: boolean;
  editDate: Date;
  editUser: string;
  companyId: string;
  dueDate: Date;
  invoiceError?: string;
}

/** Odeme plani satir kalemi goruntuleme */
export interface PaymentListItemView {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
}
