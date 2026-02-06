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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<AutoPaymentTokensResponse>(response);
}

export async function collectPayment(
  data: CollectPaymentInput
): Promise<CollectPaymentResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.COLLECT}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<CollectPaymentResponse>(response);
}

export async function fetchCustomerCards(
  customerId: string
): Promise<CardItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_CARDS(customerId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<CardItem[]>(response);
}

export async function fetchPaymentPlans(
  erpId: string
): Promise<PaymentPlanItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PAYMENT_PLANS(erpId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<PaymentPlanItem[]>(response);
}

export async function deleteAutoPaymentToken(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_TOKEN(id)}`;

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

export async function deleteCard(
  customerId: string,
  ctoken: string
): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_CARD(customerId, ctoken)}`;

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
      .catch(() => ({ message: "Kart silme hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Kart silme hatası"
    );
  }
}
