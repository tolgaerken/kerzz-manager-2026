import { apiGet, apiPost } from "../../../lib/apiClient";
import { PAYMENTS_CONSTANTS } from "../constants/payments.constants";
import type {
  PaymentLinksResponse,
  PaymentLinkQueryParams,
  CreatePaymentLinkInput,
  CreatePaymentLinkResponse,
  PaymentInfo,
  NotifyResponse
} from "../types/payment.types";

const { API_BASE_URL, ENDPOINTS } = PAYMENTS_CONSTANTS;

function buildQueryString(params: PaymentLinkQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);
  if (params.status) searchParams.set("status", params.status);
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.search) searchParams.set("search", params.search);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchPaymentLinks(
  params: PaymentLinkQueryParams = {}
): Promise<PaymentLinksResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LINKS}${queryString ? `?${queryString}` : ""}`;
  return apiGet<PaymentLinksResponse>(url);
}

export async function getPaymentInfo(linkId: string): Promise<PaymentInfo> {
  const url = `${API_BASE_URL}${ENDPOINTS.LINK_INFO(linkId)}`;
  // Payment info is public (for payment form page)
  return apiGet<PaymentInfo>(url, { skipAuth: true });
}

export async function createPaymentLink(
  data: CreatePaymentLinkInput
): Promise<CreatePaymentLinkResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.LINKS}`;
  return apiPost<CreatePaymentLinkResponse>(url, data);
}

export async function sendPaymentLinkNotification(
  linkId: string
): Promise<NotifyResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.LINK_NOTIFY(linkId)}`;
  return apiPost<NotifyResponse>(url);
}
