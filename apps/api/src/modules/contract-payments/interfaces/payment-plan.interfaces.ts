import { ContractCashRegister } from "../../contract-cash-registers/schemas/contract-cash-register.schema";
import { ContractItem } from "../../contract-items/schemas/contract-item.schema";
import { ContractSaas } from "../../contract-saas/schemas/contract-saas.schema";
import { ContractSupport } from "../../contract-supports/schemas/contract-support.schema";
import { ContractVersion } from "../../contract-versions/schemas/contract-version.schema";

/** Fatura satir kategorisi */
export type InvoiceRowCategory = "eftpos" | "support" | "version" | "item" | "saas";

/** Fatura satir kalemi */
export interface InvoiceRow {
  id: string;
  itemId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  /** Satir kategorisi - kist hesaplamada kullanilir */
  category?: InvoiceRowCategory;
}

/** Aylik fatura hesaplama sonucu */
export interface InvoiceSummary {
  id: string;
  total: number;
  rows: InvoiceRow[];
  support: ContractSupport[];
  eftpos: ContractCashRegister[];
  item: ContractItem[];
  saas: ContractSaas[];
  version: ContractVersion[];
}

/** Odeme plani olusturma sonucu */
export interface PaymentPlanResult {
  total: number;
  length: number;
}

/** Aylik odeme durumu */
export interface MonthlyPaymentStatus {
  year: string;
  month: string;
  invoice: boolean;
  payment: boolean;
  payDate: Date;
  invoiceDate: Date | undefined;
}

/** Yillik odeme durumu */
export interface YearlyPaymentStatus {
  invoice: boolean;
  payment: boolean;
  payDate: Date | undefined;
  invoiceDate: Date | undefined;
}

/** Kontrat kontrol bildirim verisi */
export interface CheckContractNotification {
  id: string;
  total: number;
  index: number;
  company: string;
  desc: string;
  totalPrice: number;
}

/** Fiyat gecmisi (price history item) */
export interface PriceHistoryItem {
  date: Date | string;
  [key: string]: unknown;
}

/** Para birimi tipi */
export type CurrencyType = "tl" | "usd" | "eur";

/** Fiyatli ve para birimli herhangi bir kontrat alt kalemi */
export interface PricedContractItem {
  price: number;
  old_price: number;
  currency: string;
  enabled: boolean;
  qty?: number;
  priceHistory?: PriceHistoryItem[];
}

/** Kontrat alt kalem toplam sonuclari */
export interface SubTotals {
  saasTotal: number;
  supportTotal: number;
  cashRegisterTotal: number;
  itemsTotal: number;
  versionTotal: number;
  oldSaasTotal: number;
  oldSupportTotal: number;
  oldCashRegisterTotal: number;
  oldItemsTotal: number;
  oldVersionTotal: number;
  oldTotal: number;
}

/** calculateAll sonuc tipi */
export interface CalculateAllResult {
  invoiceSummary: InvoiceSummary;
  subTotals: SubTotals;
}
