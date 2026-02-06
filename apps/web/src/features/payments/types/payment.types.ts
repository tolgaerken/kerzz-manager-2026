export interface PaymentLinkItem {
  _id: string;
  linkId: string;
  staffName: string;
  staffId: string;
  customerId: string;
  customerName: string;
  email: string;
  name: string;
  gsm: string;
  amount: number;
  status: string;
  statusMessage: string;
  companyId: string;
  createDate: string;
}

export interface PaymentLinkPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentLinksResponse {
  data: PaymentLinkItem[];
  pagination: PaymentLinkPagination;
}

export interface PaymentLinkQueryParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  customerId?: string;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePaymentLinkInput {
  amount: number;
  email: string;
  gsm?: string;
  name: string;
  customerName: string;
  customerId?: string;
  companyId: string;
  installment?: number;
  cardType?: string;
  canRecurring?: boolean;
  non3d?: boolean;
  staffName?: string;
  staffId?: string;
  brand?: string;
  erpId?: string;
  invoiceNo?: string;
}

export interface CreatePaymentLinkResponse {
  url: string;
  linkId: string;
}

export interface PaymentInfo {
  id: string;
  linkId: string;
  paytrToken: string;
  merchantId: string;
  paymentAmount: number;
  currency: string;
  installmentCount: string;
  non3d: string;
  storeCard: string;
  userIp: string;
  postUrl: string;
  status: string;
  statusMessage: string;
  email: string;
  name: string;
  gsm: string;
  customerName: string;
  customerId: string;
  companyId: string;
  amount: number;
  canRecurring: boolean;
  staffName: string;
  staffId: string;
  createDate: string;
  [key: string]: unknown;
}

export interface NotifyResponse {
  email: boolean;
  sms: boolean;
}
