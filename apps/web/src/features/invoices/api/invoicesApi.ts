import { INVOICES_CONSTANTS } from "../constants/invoices.constants";
import type {
  InvoiceQueryParams,
  InvoicesResponse,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = INVOICES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: InvoiceQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.invoiceType) searchParams.set("invoiceType", params.invoiceType);
  if (params.isPaid !== undefined) searchParams.set("isPaid", params.isPaid.toString());
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.contractId) searchParams.set("contractId", params.contractId);
  if (params.internalFirm) searchParams.set("internalFirm", params.internalFirm);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

// Faturaları getir
export async function fetchInvoices(params: InvoiceQueryParams = {}): Promise<InvoicesResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<InvoicesResponse>(response);
}

// Tek fatura getir
export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<Invoice>(response);
}

// Yeni fatura oluştur
export async function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  return handleResponse<Invoice>(response);
}

// Fatura güncelle
export async function updateInvoice(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/${id}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  return handleResponse<Invoice>(response);
}

// Fatura sil
export async function deleteInvoice(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
}
