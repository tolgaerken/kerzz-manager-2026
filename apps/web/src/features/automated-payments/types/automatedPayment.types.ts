export interface AutoPaymentTokenItem {
  _id: string;
  id: string;
  customerId: string;
  email: string;
  erpId: string;
  companyId: string;
  userToken: string;
  sourceId: string;
  source: string;
  userId: string;
  createDate: string;
}

export interface AutoPaymentTokenPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AutoPaymentTokensResponse {
  data: AutoPaymentTokenItem[];
  pagination: AutoPaymentTokenPagination;
}

export interface AutoPaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface CollectPaymentInput {
  customerId: string;
  amount: number;
  description?: string;
  mode?: "item" | "balance" | "custom";
  paymentPlanId?: string;
}

export interface CollectPaymentResponse {
  success: boolean;
  paymentId: string;
  amount: number;
  message: string;
}

export interface CardItem {
  ctoken: string;
  last_4: string;
  month: string;
  year: string;
  c_bank: string;
  require_cvv: string;
  c_name: string;
  c_brand: string;
  c_type: string;
}

export interface PaymentPlanItem {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  customerId: string;
  invoiceNo: string;
  paid: boolean;
  payDate: string;
  paymentDate: string;
  invoiceDate: string;
  total: number;
  invoiceTotal: number;
  balance: number;
  dueDate: string;
  onlinePaymentId: string;
  onlinePaymentError: string;
  otoPaymentAttempt: string;
}
