// Fatura tipleri
export type InvoiceType = "contract" | "sale" | "eDocuments";

// Alt tipler
export interface InvoiceRow {
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
}

export interface NotifyUser {
  name: string;
  email: string;
  gsm: string;
  smsText: string;
}

export interface InvoiceNotify {
  sms: boolean;
  email: boolean;
  push: boolean;
  sendTime: Date;
  users: NotifyUser[];
}

// Ana fatura tipi
export interface Invoice {
  _id: string;
  id: string;
  contractId: string;
  customerId: string;
  name: string;
  description: string;
  dueDate: string;
  eCreditId: string;
  erpId: string;
  grandTotal: number;
  invoiceDate: string;
  invoiceNumber: string;
  invoiceRows: InvoiceRow[];
  invoiceType: InvoiceType;
  invoiceUUID: string;
  lateFeeLastCalculationDate: string | null;
  lateFeeStatus: string;
  lateFeeTotal: number;
  payDate: string | null;
  saleId: string;
  taxTotal: number;
  total: number;
  internalFirm: string;
  reference: string;
  notify: InvoiceNotify[];
  lastNotify: string | null;
  isPaid: boolean;
  paymentSuccessDate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Query parametreleri
export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  invoiceType?: InvoiceType | "";
  isPaid?: boolean;
  customerId?: string;
  contractId?: string;
  internalFirm?: string;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

// Sayfa bilgisi
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Sayım bilgisi
export interface InvoiceCounts {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  byType: {
    contract: number;
    sale: number;
    eDocuments: number;
  };
}

// API response
export interface InvoicesResponse {
  data: Invoice[];
  pagination: PaginationInfo;
  counts?: InvoiceCounts;
}

// Form için input tipleri
export interface CreateInvoiceInput {
  contractId?: string;
  customerId?: string;
  name?: string;
  description?: string;
  dueDate?: string;
  eCreditId?: string;
  erpId?: string;
  grandTotal?: number;
  invoiceDate?: string;
  invoiceNumber?: string;
  invoiceRows?: Partial<InvoiceRow>[];
  invoiceType?: InvoiceType;
  invoiceUUID?: string;
  taxTotal?: number;
  total?: number;
  internalFirm?: string;
  reference?: string;
  isPaid?: boolean;
  paymentSuccessDate?: string;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {}
