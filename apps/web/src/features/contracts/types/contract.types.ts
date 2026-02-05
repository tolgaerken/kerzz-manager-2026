export type ContractFlow = "active" | "archive" | "future" | "all";

export interface Contract {
  _id: string;
  id: string;
  brand: string;
  company: string;
  contractFlow: string;
  contractId: string;
  description: string;
  startDate: string;
  endDate: string;
  yearly: boolean;
  yearlyTotal: number;
  saasTotal: number;
  total: number;
  enabled: boolean;
  blockedLicance: boolean;
  no: number;
  customerId: string;
  internalFirm: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  flow?: ContractFlow;
  yearly?: boolean;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface ContractCounts {
  active: number;
  archive: number;
  future: number;
  yearly: number;
  monthly: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ContractsResponse {
  data: Contract[];
  meta: PaginationMeta;
  counts: ContractCounts;
}

// Contract Detail Types
export type Currency = "tl" | "usd" | "eur";

export interface ContractUser {
  _id: string;
  id: string;
  contractId: string;
  email: string;
  gsm: string;
  name: string;
  role: string;
  editDate: string;
  editUser: string;
}

export interface ContractSupport {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  price: number;
  old_price: number;
  currency: Currency;
  type: string;
  yearly: boolean;
  enabled: boolean;
  blocked: boolean;
  expired: boolean;
  lastOnlineDay: number;
  calulatedPrice: number;
  editDate: string;
  editUser: string;
}

export interface ContractSaas {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  description: string;
  price: number;
  old_price: number;
  qty: number;
  currency: Currency;
  yearly: boolean;
  enabled: boolean;
  expired: boolean;
  blocked: boolean;
  productId: string;
  total: number;
  editDate: string;
  editUser: string;
}

export interface ContractCashRegister {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  legalId: string;
  model: string;
  type: string;
  price: number;
  old_price: number;
  currency: Currency;
  yearly: boolean;
  enabled: boolean;
  expired: boolean;
  eftPosActive: boolean;
  folioClose: boolean;
  editDate: string;
  editUser: string;
}

export interface ContractVersion {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  price: number;
  old_price: number;
  currency: Currency;
  type: string;
  enabled: boolean;
  expired: boolean;
  editDate: string;
  editUser: string;
}

export interface ContractItem {
  _id: string;
  id: string;
  contractId: string;
  itemId: string;
  description: string;
  price: number;
  old_price: number;
  qty: number;
  qtyDynamic: boolean;
  currency: Currency;
  yearly: boolean;
  enabled: boolean;
  expired: boolean;
  erpId: string;
  editDate: string;
  editUser: string;
}

export interface ContractDocument {
  _id: string;
  id: string;
  contractId: string;
  description: string;
  filename: string;
  type: string;
  documentDate: string;
  userId: string;
  saleId: string;
  offerId: string;
  customerId: string;
  licanceId: string;
  documentVersion: string;
  editDate: string;
  editUser: string;
}

export interface PaymentListItem {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
}

export interface ContractPayment {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  customerId: string;
  licanceId: string;
  invoiceNo: string;
  paid: boolean;
  payDate: string;
  paymentDate: string;
  invoiceDate: string;
  total: number;
  invoiceTotal: number;
  balance: number;
  list: PaymentListItem[];
  yearly: boolean;
  eInvoice: boolean;
  uuid: string;
  ref: string;
  taxNo: string;
  internalFirm: string;
  contractNumber: number;
  segment: string;
  block: boolean;
  editDate: string;
  editUser: string;
}

// Response types
export interface ContractDetailListResponse<T> {
  data: T[];
  total: number;
}
