import { E_DOC_CREDITS_CONSTANTS } from "../constants/eDocCredits.constants";
import type {
  EDocCreditsResponse,
  EDocCreditQueryParams,
  EDocCreditFormData,
  EDocCreditItem,
} from "../types/eDocCredit.types";

const { API_BASE_URL, ENDPOINTS } = E_DOC_CREDITS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Sunucu Hatası"
    );
  }
  return response.json();
}

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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<EDocCreditsResponse>(response);
}

export async function createEDocCredit(
  data: EDocCreditFormData
): Promise<EDocCreditItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<EDocCreditItem>(response);
}

export async function updateEDocCredit(
  id: string,
  data: Partial<EDocCreditFormData>
): Promise<EDocCreditItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<EDocCreditItem>(response);
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

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<CreditInvoiceResult>(response);
}

export async function deleteEDocCredit(id: string): Promise<void> {
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
      (error as { message?: string }).message || "Silme hatası"
    );
  }
}
