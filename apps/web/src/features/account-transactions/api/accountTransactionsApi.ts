import { apiGet } from "../../../lib/apiClient";
import { ACCOUNT_TRANSACTIONS_CONSTANTS } from "../constants/accountTransactions.constants";
import type {
  Account,
  AccountTransaction,
  DocumentDetail,
  AccountTransactionsQueryParams,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = ACCOUNT_TRANSACTIONS_CONSTANTS;

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

  return apiGet<Account[]>(url);
}

export async function fetchAccountTransactions(
  accountId: string,
  params: AccountTransactionsQueryParams
): Promise<AccountTransaction[]> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.TRANSACTIONS}/${encodeURIComponent(accountId)}?${queryString}`;

  return apiGet<AccountTransaction[]>(url);
}

export async function fetchDocumentDetail(
  documentId: string,
  params: AccountTransactionsQueryParams
): Promise<DocumentDetail[]> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.DOCUMENT_DETAIL}/${encodeURIComponent(documentId)}?${queryString}`;

  return apiGet<DocumentDetail[]>(url);
}
