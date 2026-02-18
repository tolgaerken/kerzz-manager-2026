export interface CustomerSegment {
  _id: string;
  name: string;
  description: string;
  invoiceOverdueNotification: boolean;
  newInvoiceNotification: boolean;
  lastPaymentNotification: boolean;
  balanceNotification: boolean;
  annualContractExpiryNotification: boolean;
  monthlyContractExpiryNotification: boolean;
  canBlockCashRegister: boolean;
  canBlockLicense: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSegmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CustomerSegmentsResponse {
  data: CustomerSegment[];
  meta: PaginationMeta;
}

export interface CreateCustomerSegmentInput {
  name: string;
  description?: string;
  invoiceOverdueNotification?: boolean;
  newInvoiceNotification?: boolean;
  lastPaymentNotification?: boolean;
  balanceNotification?: boolean;
  annualContractExpiryNotification?: boolean;
  monthlyContractExpiryNotification?: boolean;
  canBlockCashRegister?: boolean;
  canBlockLicense?: boolean;
  enabled?: boolean;
}

export interface UpdateCustomerSegmentInput {
  name?: string;
  description?: string;
  invoiceOverdueNotification?: boolean;
  newInvoiceNotification?: boolean;
  lastPaymentNotification?: boolean;
  balanceNotification?: boolean;
  annualContractExpiryNotification?: boolean;
  monthlyContractExpiryNotification?: boolean;
  canBlockCashRegister?: boolean;
  canBlockLicense?: boolean;
  enabled?: boolean;
}
