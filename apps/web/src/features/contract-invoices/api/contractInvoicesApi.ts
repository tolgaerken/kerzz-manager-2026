import { apiGet, apiPost } from "../../../lib/apiClient";
import { CONTRACT_INVOICES_CONSTANTS } from "../constants";
import type {
  PaymentPlansQueryParams,
  PaymentPlansResponse,
  CreateInvoiceResult,
  CheckContractResult,
  CreateInvoicesParams,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CONTRACT_INVOICES_CONSTANTS;

/**
 * Belirli donem ve tarih icin odeme planlarini getirir.
 */
export async function fetchPaymentPlans(
  params: PaymentPlansQueryParams,
): Promise<PaymentPlansResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("period", params.period);
  searchParams.set("date", params.date);
  if (params.search) searchParams.set("search", params.search);

  const url = `${API_BASE_URL}${ENDPOINTS.PAYMENT_PLANS}?${searchParams.toString()}`;

  return apiGet<PaymentPlansResponse>(url);
}

/**
 * Secili odeme planlarindan fatura olusturur.
 * @param params.merge - true ise ayni cariye ait planlari tek faturada birlestirir
 */
export async function createInvoices(
  params: CreateInvoicesParams,
): Promise<CreateInvoiceResult[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE_INVOICES}`;

  return apiPost<CreateInvoiceResult[]>(url, {
    planIds: params.planIds,
    merge: params.merge,
  });
}

/**
 * Secili odeme planlarindaki kontratlari kontrol eder.
 */
export async function checkContracts(
  planIds: string[],
): Promise<CheckContractResult[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CHECK_CONTRACTS}`;

  return apiPost<CheckContractResult[]>(url, { planIds });
}
