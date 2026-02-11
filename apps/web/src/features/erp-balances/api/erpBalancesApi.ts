import { apiGet, apiPost } from "../../../lib/apiClient";
import { ERP_BALANCES_CONSTANTS } from "../constants/erpBalances.constants";
import type {
  ErpBalanceQueryParams,
  ErpBalancesResponse,
  ErpBalance,
  ErpBalanceStatus,
  ErpBalanceRefreshResult,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = ERP_BALANCES_CONSTANTS;

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

  return apiGet<ErpBalancesResponse>(url);
}

export async function fetchErpBalancesByCompany(
  companyId: string
): Promise<ErpBalance[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES_BY_COMPANY}/${companyId}`;

  return apiGet<ErpBalance[]>(url);
}

export async function fetchErpBalanceStatus(): Promise<ErpBalanceStatus> {
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES_STATUS}`;

  return apiGet<ErpBalanceStatus>(url);
}

export async function refreshErpBalances(): Promise<ErpBalanceRefreshResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.BALANCES_REFRESH}`;

  return apiPost<ErpBalanceRefreshResult>(url, {});
}
