import { ERP_BALANCES_CONSTANTS } from "../constants/erpBalances.constants";
import type {
  ErpBalanceQueryParams,
  ErpBalancesResponse,
  ErpBalance,
  ErpBalanceStatus,
  ErpBalanceRefreshResult,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = ERP_BALANCES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: ErpBalanceQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.internalFirm) searchParams.set("internalFirm", params.internalFirm);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchErpBalances(
  params: ErpBalanceQueryParams = {}
): Promise<ErpBalancesResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ErpBalancesResponse>(response);
}

export async function fetchErpBalancesByCompany(
  companyId: string
): Promise<ErpBalance[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES_BY_COMPANY}/${companyId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ErpBalance[]>(response);
}

export async function fetchErpBalanceStatus(): Promise<ErpBalanceStatus> {
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES_STATUS}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ErpBalanceStatus>(response);
}

export async function refreshErpBalances(): Promise<ErpBalanceRefreshResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES_REFRESH}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ErpBalanceRefreshResult>(response);
}
