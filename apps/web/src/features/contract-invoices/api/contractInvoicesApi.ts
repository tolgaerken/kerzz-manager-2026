import { CONTRACT_INVOICES_CONSTANTS } from "../constants";
import type {
  PaymentPlansQueryParams,
  PaymentPlansResponse,
  CreateInvoiceResult,
  CheckContractResult,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CONTRACT_INVOICES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<PaymentPlansResponse>(response);
}

/**
 * Secili odeme planlarindan fatura olusturur.
 */
export async function createInvoices(
  planIds: string[],
): Promise<CreateInvoiceResult[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE_INVOICES}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ planIds }),
  });

  return handleResponse<CreateInvoiceResult[]>(response);
}

/**
 * Secili odeme planlarindaki kontratlari kontrol eder.
 */
export async function checkContracts(
  planIds: string[],
): Promise<CheckContractResult[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CHECK_CONTRACTS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ planIds }),
  });

  return handleResponse<CheckContractResult[]>(response);
}
