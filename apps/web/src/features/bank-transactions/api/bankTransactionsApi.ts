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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<BankTransactionsResponse>(response);
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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<BankSummaryResponse>(response);
}

// Banka islemi guncelle
export async function updateBankTransaction(
  id: string,
  data: UpdateBankTransactionInput,
): Promise<BankTransaction> {
  const url = `${API_BASE_URL}${ENDPOINTS.BANK_TRANSACTIONS}/${id}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<BankTransaction>(response);
}

// ERP banka haritalarini getir
export async function fetchErpBankMaps(): Promise<BankAccount[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.ERP_BANK_MAPS}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<BankAccount[]>(response);
}

// ERP cari hesaplari getir
export async function fetchErpAccounts(
  companyId: string,
): Promise<ErpAccount[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.ERP_ACCOUNTS}/${companyId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ErpAccount[]>(response);
}

// ERP muhasebe hesaplarini getir
export async function fetchErpGlAccounts(
  companyId: string,
): Promise<ErpGlAccount[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.ERP_GL_ACCOUNTS}/${companyId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ErpGlAccount[]>(response);
}
