import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { E_INVOICE_PRICES_CONSTANTS } from "../constants/eInvoicePrices.constants";
import type {
  EInvoicePricesResponse,
  EInvoicePriceQueryParams,
  EInvoicePriceFormData,
  EInvoicePriceItem,
} from "../types/eInvoicePrice.types";

const { API_BASE_URL, ENDPOINTS } = E_INVOICE_PRICES_CONSTANTS;

function buildQueryString(params: EInvoicePriceQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.customerErpId !== undefined)
    searchParams.set("customerErpId", params.customerErpId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  return searchParams.toString();
}

export async function fetchEInvoicePrices(
  params: EInvoicePriceQueryParams = {},
): Promise<EInvoicePricesResponse> {
  const qs = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LIST}${qs ? `?${qs}` : ""}`;

  return apiGet<EInvoicePricesResponse>(url);
}

export async function createEInvoicePrice(
  data: EInvoicePriceFormData,
): Promise<EInvoicePriceItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;

  return apiPost<EInvoicePriceItem>(url, data);
}

export async function updateEInvoicePrice(
  id: string,
  data: Partial<EInvoicePriceFormData>,
): Promise<EInvoicePriceItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;

  return apiPatch<EInvoicePriceItem>(url, data);
}

export async function deleteEInvoicePrice(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE(id)}`;

  return apiDelete<void>(url);
}

export async function bulkUpsertEInvoicePrices(
  items: EInvoicePriceFormData[],
): Promise<EInvoicePricesResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.BULK_UPSERT}`;

  return apiPost<EInvoicePricesResponse>(url, items);
}

export async function deleteCustomerPrices(
  customerErpId: string,
): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_BY_CUSTOMER(customerErpId)}`;

  return apiDelete<void>(url);
}
