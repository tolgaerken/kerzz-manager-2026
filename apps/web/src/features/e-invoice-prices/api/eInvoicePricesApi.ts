import { E_INVOICE_PRICES_CONSTANTS } from "../constants/eInvoicePrices.constants";
import type {
  EInvoicePricesResponse,
  EInvoicePriceQueryParams,
  EInvoicePriceFormData,
  EInvoicePriceItem,
} from "../types/eInvoicePrice.types";

const { API_BASE_URL, ENDPOINTS } = E_INVOICE_PRICES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Sunucu hatası",
    );
  }
  return response.json();
}

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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<EInvoicePricesResponse>(response);
}

export async function createEInvoicePrice(
  data: EInvoicePriceFormData,
): Promise<EInvoicePriceItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<EInvoicePriceItem>(response);
}

export async function updateEInvoicePrice(
  id: string,
  data: Partial<EInvoicePriceFormData>,
): Promise<EInvoicePriceItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<EInvoicePriceItem>(response);
}

export async function deleteEInvoicePrice(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE(id)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response
      .json()
      .catch(() => ({ message: "Silme hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Silme hatası",
    );
  }
}

export async function bulkUpsertEInvoicePrices(
  items: EInvoicePriceFormData[],
): Promise<EInvoicePricesResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.BULK_UPSERT}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(items),
  });

  return handleResponse<EInvoicePricesResponse>(response);
}

export async function deleteCustomerPrices(
  customerErpId: string,
): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_BY_CUSTOMER(customerErpId)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response
      .json()
      .catch(() => ({ message: "Silme hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Silme hatası",
    );
  }
}
