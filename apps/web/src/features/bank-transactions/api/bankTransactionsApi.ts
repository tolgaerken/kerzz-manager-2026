import { apiGet, apiPatch } from "../../../lib/apiClient";
import { BANK_TRANSACTIONS_CONSTANTS } from "../constants";
import type {
  BankTransactionQueryParams,
  BankTransactionsResponse,
  BankTransaction,
  BankSummaryResponse,
  BankAccount,
  ErpAccount,
  ErpGlAccount,
  UpdateBankTransactionInput,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = BANK_TRANSACTIONS_CONSTANTS;

function buildQueryString(params: BankTransactionQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.bankAccId) searchParams.set("bankAccId", params.bankAccId);
  if (params.erpStatus) searchParams.set("erpStatus", params.erpStatus);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

// Banka islemlerini getir
export async function fetchBankTransactions(
  params: BankTransactionQueryParams = {},
): Promise<BankTransactionsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.BANK_TRANSACTIONS}${queryString ? `?${queryString}` : ""}`;

  return apiGet<BankTransactionsResponse>(url);
}

// Banka ozet bilgilerini getir
export async function fetchBankSummary(
  startDate: string,
  endDate: string,
): Promise<BankSummaryResponse> {
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.set("startDate", startDate);
  if (endDate) searchParams.set("endDate", endDate);

  const url = `${API_BASE_URL}${ENDPOINTS.SUMMARY}?${searchParams.toString()}`;

  return apiGet<BankSummaryResponse>(url);
}

// Banka islemi guncelle
export async function updateBankTransaction(
  id: string,
  data: UpdateBankTransactionInput,
): Promise<BankTransaction> {
  const url = `${API_BASE_URL}${ENDPOINTS.BANK_TRANSACTIONS}/${id}`;

  return apiPatch<BankTransaction>(url, data);
}

// ERP banka haritalarini getir
export async function fetchErpBankMaps(): Promise<BankAccount[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.ERP_BANK_MAPS}`;

  return apiGet<BankAccount[]>(url);
}

// ERP cari hesaplari getir
export async function fetchErpAccounts(
  companyId: string,
): Promise<ErpAccount[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.ERP_ACCOUNTS}/${companyId}`;

  return apiGet<ErpAccount[]>(url);
}

// ERP muhasebe hesaplarini getir
export async function fetchErpGlAccounts(
  companyId: string,
): Promise<ErpGlAccount[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.ERP_GL_ACCOUNTS}/${companyId}`;

  return apiGet<ErpGlAccount[]>(url);
}
