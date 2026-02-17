// Filtreleme için kullanılan flow tipi (tarih bazlı hesaplanır)
export type ContractFlow = "active" | "free" | "archive" | "future" | "all";

// Fatura kesim zamanlaması tipi
export type BillingType = "future" | "past";

export interface Contract {
  _id: string;
  id: string;
  brand: string;
  company: string;
  contractFlow: string; // "future" | "past" - Fatura kesim zamanlaması
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
  isFree: boolean;
  isActive: boolean;
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
  free: number;
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

export interface CreateContractInput {
  customerId: string;
  description?: string;
  startDate: string;
  endDate?: string;
  noEndDate?: boolean;
  internalFirm?: string;
  yearly?: boolean;
  maturity?: number;
  lateFeeType?: string;
  incraseRateType?: string;
  incrasePeriod?: string;
  noVat?: boolean;
  noNotification?: boolean;
  contractFlow?: BillingType;
  isActive?: boolean;
}

export interface UpdateContractInput extends CreateContractInput {
  id: string;
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
  startDate?: string;
  activated?: boolean;
  activatedAt?: string;
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
  startDate?: string;
  activated?: boolean;
  activatedAt?: string;
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
  startDate?: string;
  activated?: boolean;
  activatedAt?: string;
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
  startDate?: string;
  activated?: boolean;
  activatedAt?: string;
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
  startDate?: string;
  activated?: boolean;
  activatedAt?: string;
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

export type PaymentType = "regular" | "prorated";

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
  // Kist (prorated) odeme alanlari
  type?: PaymentType;
  proratedDays?: number;
  proratedStartDate?: string;
  sourceItemId?: string;
}

// Response types
export interface ContractDetailListResponse<T> {
  data: T[];
  total: number;
}

// ─── Check Contract (Odeme Plani Hesaplama) Tipleri ─────────────

export type InvoiceRowCategory = "eftpos" | "support" | "version" | "item" | "saas";

export interface InvoiceRow {
  id: string;
  itemId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  category: InvoiceRowCategory;
}

export interface InvoiceSummary {
  id: string;
  total: number;
  rows: InvoiceRow[];
}

export interface PaymentPlanResult {
  total: number;
  length: number;
}

export interface CheckContractResult {
  plans: ContractPayment[];
  invoiceSummary: InvoiceSummary;
  result: PaymentPlanResult;
}
