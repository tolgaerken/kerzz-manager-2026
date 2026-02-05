export interface InvoiceRowDto {
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

export interface NotifyUserDto {
  name: string;
  email: string;
  gsm: string;
  smsText: string;
}

export interface InvoiceNotifyDto {
  sms: boolean;
  email: boolean;
  push: boolean;
  sendTime: Date;
  users: NotifyUserDto[];
}

export interface InvoiceResponseDto {
  _id: string;
  id: string;
  contractId: string;
  customerId: string;
  name: string;
  description: string;
  dueDate: Date;
  eCreditId: string;
  erpId: string;
  grandTotal: number;
  invoiceDate: Date;
  invoiceNumber: string;
  invoiceRows: InvoiceRowDto[];
  invoiceType: string;
  invoiceUUID: string;
  lateFeeLastCalculationDate: Date;
  lateFeeStatus: string;
  lateFeeTotal: number;
  payDate: Date;
  saleId: string;
  taxTotal: number;
  total: number;
  internalFirm: string;
  reference: string;
  notify: InvoiceNotifyDto[];
  lastNotify: Date;
  isPaid: boolean;
  paymentSuccessDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedInvoicesResponseDto {
  data: InvoiceResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts?: InvoiceCountsDto;
}

export interface InvoiceCountsDto {
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
