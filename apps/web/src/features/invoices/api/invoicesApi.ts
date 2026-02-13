import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { INVOICES_CONSTANTS } from "../constants/invoices.constants";
import type {
  InvoiceQueryParams,
  InvoicesResponse,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  UnpaidSummaryByErpItem
} from "../types";

const { API_BASE_URL, ENDPOINTS } = INVOICES_CONSTANTS;

function buildQueryString(params: InvoiceQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.invoiceType) searchParams.set("invoiceType", params.invoiceType);
  if (params.isPaid !== undefined) searchParams.set("isPaid", params.isPaid.toString());
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.erpId) searchParams.set("erpId", params.erpId);
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
  return apiGet<InvoicesResponse>(url);
}

// Tek fatura getir
export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/${id}`;
  return apiGet<Invoice>(url);
}

// Yeni fatura oluştur
export async function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}`;
  return apiPost<Invoice>(url, data);
}

// Fatura güncelle
export async function updateInvoice(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/${id}`;
  return apiPatch<Invoice>(url, data);
}

// Fatura sil
export async function deleteInvoice(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/${id}`;
  return apiDelete<void>(url);
}

// Müşteri bazında ödenmemiş fatura özeti (erpId = CariKodu)
export async function fetchUnpaidInvoiceSummaryByErp(): Promise<UnpaidSummaryByErpItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.INVOICES}/unpaid-summary-by-erp`;
  return apiGet<UnpaidSummaryByErpItem[]>(url);
}
