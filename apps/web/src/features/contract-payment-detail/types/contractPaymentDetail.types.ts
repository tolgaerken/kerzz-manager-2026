export type ContractItemCategory = "eftpos" | "support" | "saas" | "item" | "version";

export interface ContractPaymentItemDto {
  category: ContractItemCategory;
  description: string;
  brand: string;
  currency: string;
  qty: number;
  oldPrice: number;
  newPrice: number;
  oldTotal: number;
  newTotal: number;
  changePercent: number;
}

export interface CurrencyBreakdown {
  tl: { old: number; new: number };
  usd: { old: number; new: number; convertedToTL: number };
  eur: { old: number; new: number; convertedToTL: number };
}

export interface ContractPaymentSummaryDto {
  oldTotalTL: number;
  newTotalTL: number;
  increaseRate: number;
  inflationSource: string;
  currencyBreakdown: CurrencyBreakdown;
}

export interface ContractInfoDto {
  contractId: string;
  brand: string;
  company: string;
  startDate: string;
  endDate: string;
  yearly: boolean;
  incraseRateType: string;
  incrasePeriod: string;
}

export interface ContractPaymentDetailDto {
  contract: ContractInfoDto;
  items: ContractPaymentItemDto[];
  summary: ContractPaymentSummaryDto;
  paymentAmount: number;
}

export const CATEGORY_LABELS: Record<ContractItemCategory, string> = {
  eftpos: "EFT-POS / Yazarkasa",
  support: "Destek",
  saas: "SaaS",
  item: "Diğer Kalemler",
  version: "Versiyon",
};
