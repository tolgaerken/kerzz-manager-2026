import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { E_DOC_CREDITS_CONSTANTS } from "../constants/eDocCredits.constants";
import type {
  EDocCreditsResponse,
  EDocCreditQueryParams,
  EDocCreditFormData,
  EDocCreditItem,
} from "../types/eDocCredit.types";

const { API_BASE_URL, ENDPOINTS } = E_DOC_CREDITS_CONSTANTS;

function buildQueryString(params: EDocCreditQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.erpId) searchParams.set("erpId", params.erpId);
  if (params.currency) searchParams.set("currency", params.currency);
  if (params.internalFirm) searchParams.set("internalFirm", params.internalFirm);
  if (params.month) searchParams.set("month", params.month.toString());
  if (params.year) searchParams.set("year", params.year.toString());
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchEDocCredits(
  params: EDocCreditQueryParams = {}
): Promise<EDocCreditsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LIST}${queryString ? `?${queryString}` : ""}`;

  return apiGet<EDocCreditsResponse>(url);
}

export async function createEDocCredit(
  data: EDocCreditFormData
): Promise<EDocCreditItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;

  return apiPost<EDocCreditItem>(url, data);
}

export async function updateEDocCredit(
  id: string,
  data: Partial<EDocCreditFormData>
): Promise<EDocCreditItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;

  return apiPatch<EDocCreditItem>(url, data);
}

export interface CreditInvoiceResult {
  invoiceNumber: string;
  invoiceUUID: string;
  invoiceDate: string;
  grandTotal: number;
  taxTotal: number;
  total: number;
}

export async function createInvoiceForCredit(
  id: string
): Promise<CreditInvoiceResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE_INVOICE(id)}`;

  return apiPost<CreditInvoiceResult>(url, {});
}

export async function deleteEDocCredit(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE(id)}`;

  return apiDelete<void>(url);
}
