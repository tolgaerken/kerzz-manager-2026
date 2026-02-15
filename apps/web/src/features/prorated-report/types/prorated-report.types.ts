export interface ProratedListItem {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
}

export interface ProratedPlan {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  customerId: string;
  taxNo: string;
  total: number;
  paid: boolean;
  invoiceNo: string;
  invoiceTotal: number;
  payDate: string;
  proratedDays: number;
  proratedStartDate: string;
  contractNumber: number;
  internalFirm: string;
  list: ProratedListItem[];
  type: string;
}

export interface ProratedReportResponse {
  data: ProratedPlan[];
  total: number;
}

export interface ProratedReportFilter {
  paid?: boolean;
  invoiced?: boolean;
  contractId?: string;
}
