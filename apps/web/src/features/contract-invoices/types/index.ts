/** Odeme plani satir kalemi */
export interface PaymentListItem {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
}

/** Zenginlestirilmis odeme plani */
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
  companyId: string;
  dueDate: string;
  invoiceError?: string;
}

/** Odeme planlari sorgu parametreleri */
export interface PaymentPlansQueryParams {
  period: "monthly" | "yearly";
  date: string;
  search?: string;
}

/** Odeme planlari API response */
export interface PaymentPlansResponse {
  data: EnrichedPaymentPlan[];
  total: number;
}

/** Fatura olusturma sonucu */
export interface CreateInvoiceResult {
  planId: string;
  success: boolean;
  invoiceNo?: string;
  uuid?: string;
  error?: string;
  /** Birlestirilmis faturalarda dahil edilen plan ID'leri */
  mergedPlanIds?: string[];
}

/** Fatura olusturma parametreleri */
export interface CreateInvoicesParams {
  planIds: string[];
  /** Ayni cariye ait planlari tek faturada birlestir */
  merge?: boolean;
}

/** Kontrat kontrol sonucu */
export interface CheckContractResult {
  planId: string;
  success: boolean;
  error?: string;
}

/** Donem tipi */
export type PeriodType = "monthly" | "yearly";

/** Segment tipleri */
export const SEGMENTS = [
  { id: "standart", name: "Standart" },
  { id: "silver", name: "Silver" },
  { id: "bronze", name: "Bronze" },
  { id: "gold", name: "Gold" },
  { id: "platin", name: "Platin" },
  { id: "diamond", name: "Diamond" },
] as const;

/** Segment renkleri */
export const SEGMENT_COLORS: Record<string, string> = {
  standart: "transparent",
  silver: "rgba(192, 192, 192, 0.3)",
  bronze: "rgba(205, 127, 50, 0.3)",
  gold: "rgba(255, 215, 0, 0.3)",
  platin: "rgba(229, 228, 226, 0.4)",
  diamond: "rgba(185, 242, 255, 0.3)",
};
