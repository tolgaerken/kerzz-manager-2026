import { apiGet, apiPost, apiDelete } from "../../../lib/apiClient";
import { AUTOMATED_PAYMENTS_CONSTANTS } from "../constants/automatedPayments.constants";
import type {
  AutoPaymentTokensResponse,
  AutoPaymentQueryParams,
  CollectPaymentInput,
  CollectPaymentResponse,
  CardItem,
  PaymentPlanItem,
} from "../types/automatedPayment.types";

const { API_BASE_URL, ENDPOINTS } = AUTOMATED_PAYMENTS_CONSTANTS;

function buildQueryString(params: AutoPaymentQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.companyId) searchParams.set("companyId", params.companyId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchAutoPaymentTokens(
  params: AutoPaymentQueryParams = {}
): Promise<AutoPaymentTokensResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.TOKENS}${queryString ? `?${queryString}` : ""}`;

  return apiGet<AutoPaymentTokensResponse>(url);
}

export async function collectPayment(
  data: CollectPaymentInput
): Promise<CollectPaymentResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.COLLECT}`;

  return apiPost<CollectPaymentResponse>(url, data);
}

export async function fetchCustomerCards(
  customerId: string
): Promise<CardItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_CARDS(customerId)}`;

  return apiGet<CardItem[]>(url);
}

export async function fetchPaymentPlans(
  erpId: string
): Promise<PaymentPlanItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PAYMENT_PLANS(erpId)}`;

  return apiGet<PaymentPlanItem[]>(url);
}

export async function deleteAutoPaymentToken(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_TOKEN(id)}`;

  return apiDelete<void>(url);
}

export async function deleteCard(
  customerId: string,
  ctoken: string
): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_CARD(customerId, ctoken)}`;

  return apiDelete<void>(url);
}
