import { ACCOUNT_TRANSACTIONS_CONSTANTS } from "../constants/accountTransactions.constants";
import type {
  Account,
  AccountTransaction,
  DocumentDetail,
  AccountTransactionsQueryParams,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = ACCOUNT_TRANSACTIONS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: AccountTransactionsQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("year", params.year.toString());
  searchParams.set("company", params.company);
  return searchParams.toString();
}

export async function fetchAccounts(
  params: AccountTransactionsQueryParams
): Promise<Account[]> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.ACCOUNTS}?${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Account[]>(response);
}

export async function fetchAccountTransactions(
  accountId: string,
  params: AccountTransactionsQueryParams
): Promise<AccountTransaction[]> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.TRANSACTIONS}/${encodeURIComponent(accountId)}?${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<AccountTransaction[]>(response);
}

export async function fetchDocumentDetail(
  documentId: string,
  params: AccountTransactionsQueryParams
): Promise<DocumentDetail[]> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.DOCUMENT_DETAIL}/${encodeURIComponent(documentId)}?${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<DocumentDetail[]>(response);
}
