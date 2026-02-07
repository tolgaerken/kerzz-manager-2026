export type ErpStatus = "waiting" | "error" | "success" | "manual";

export interface BankTransaction {
  _id: string;
  id: string;
  accountId: string;
  name: string;
  dc: string;
  code: string;
  amount: number;
  balance: number;
  description: string;
  businessDate: string;
  createDate: string;
  opponentId: string;
  opponentIban: string;
  sourceId: string;
  source: string;
  bankAccId: string;
  bankAccName: string;
  bankId: string;
  bankName: string;
  erpStatus: ErpStatus;
  erpMessage: string;
  erpGlAccountCode: string;
  erpAccountCode: string;
}

export interface BankTransactionQueryParams {
  startDate?: string;
  endDate?: string;
  bankAccId?: string;
  erpStatus?: string;
  page?: number;
  limit?: number;
}

export interface BankTransactionsResponse {
  data: BankTransaction[];
  total: number;
}

export interface BankSummaryItem {
  bankAccId: string;
  bankAccName: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface BankSummaryResponse {
  summaries: BankSummaryItem[];
  totalInflow: number;
  totalOutflow: number;
  totalBalance: number;
  transactionCount: number;
}

export interface BankAccount {
  bankAccId: string;
  bankAccName: string;
  erpCompanyId: string;
  erpMuhCode: string;
}

export interface ErpAccount {
  accountCode: string;
  accountName: string;
}

export interface ErpGlAccount {
  glCode: string;
  glName: string;
}

export interface UpdateBankTransactionInput {
  erpAccountCode?: string;
  erpGlAccountCode?: string;
  erpStatus?: ErpStatus;
  erpMessage?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
