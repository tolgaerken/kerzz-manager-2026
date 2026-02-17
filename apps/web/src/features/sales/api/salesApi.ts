import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { SALES_CONSTANTS } from "../constants/sales.constants";
import type {
  Sale,
  SalesResponse,
  SaleQueryParams,
  SaleStats,
  CreateSaleInput,
  UpdateSaleInput,
  ApprovalRequestResult,
  ApprovalActionResult,
} from "../types/sale.types";

const { API_BASE_URL, ENDPOINTS } = SALES_CONSTANTS;

function buildQueryString(params: SaleQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.sellerId) searchParams.set("sellerId", params.sellerId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.period) searchParams.set("period", params.period);

  return searchParams.toString();
}

export async function fetchSales(
  params: SaleQueryParams = {}
): Promise<SalesResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}${queryString ? `?${queryString}` : ""}`;

  return apiGet<SalesResponse>(url);
}

export async function fetchSaleById(id: string): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}`;

  return apiGet<Sale>(url);
}

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}`;

  return apiPost<Sale>(url, input);
}

export async function updateSale(
  id: string,
  input: UpdateSaleInput
): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}`;

  return apiPatch<Sale>(url, input);
}

export async function deleteSale(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}`;

  return apiDelete<void>(url);
}

export async function calculateSaleTotals(id: string): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/calculate`;

  return apiPost<Sale>(url, {});
}

export async function approveSale(
  id: string,
  note?: string
): Promise<ApprovalActionResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/approve`;

  return apiPatch<ApprovalActionResult>(url, { note });
}

export async function revertSale(id: string): Promise<Sale> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/revert`;

  return apiPost<Sale>(url, {});
}

export async function fetchSaleStats(
  params: SaleQueryParams = {}
): Promise<SaleStats> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/stats${queryString ? `?${queryString}` : ""}`;

  return apiGet<SaleStats>(url);
}

// ==================== ONAY AKIŞI API FONKSİYONLARI ====================

/**
 * Toplu onay isteği gönderir
 */
export async function requestSaleApproval(
  saleIds: string[],
  note?: string
): Promise<ApprovalRequestResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/approval-requests`;

  return apiPost<ApprovalRequestResult>(url, { saleIds, note });
}

/**
 * Bekleyen onayları listeler
 */
export async function fetchPendingApprovals(): Promise<Sale[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/pending-approvals`;

  return apiGet<Sale[]>(url);
}

/**
 * Satışı reddeder
 */
export async function rejectSale(
  id: string,
  reason: string
): Promise<ApprovalActionResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/${encodeURIComponent(id)}/reject`;

  return apiPatch<ApprovalActionResult>(url, { reason });
}

/**
 * Toplu onay işlemi
 */
export async function bulkApproveSales(
  saleIds: string[],
  note?: string
): Promise<ApprovalRequestResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.SALES}/bulk-approve`;

  return apiPost<ApprovalRequestResult>(url, { saleIds, note });
}
