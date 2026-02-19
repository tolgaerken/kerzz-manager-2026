import { apiGet, apiPost } from "../../../lib/apiClient";
import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type {
  InvoiceQueueQueryParams,
  ContractQueueQueryParams,
  PaginatedQueueInvoicesResponse,
  PaginatedQueueContractsResponse,
  QueueStats,
  ManualSendDto,
  ManualSendResponse,
  QueuePreviewParams,
  QueuePreviewResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

function buildInvoiceQueryString(params?: InvoiceQueueQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set("type", params.type);
  if (params.overdueDaysMin != null) searchParams.set("overdueDaysMin", params.overdueDaysMin.toString());
  if (params.overdueDaysMax != null) searchParams.set("overdueDaysMax", params.overdueDaysMax.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  return searchParams.toString();
}

function buildContractQueryString(params?: ContractQueueQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.contractType) searchParams.set("contractType", params.contractType);
  if (params.milestone) searchParams.set("milestone", params.milestone);
  if (params.daysFromExpiry != null) searchParams.set("daysFromExpiry", params.daysFromExpiry.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  return searchParams.toString();
}

export const notificationQueueApi = {
  async getInvoiceQueue(
    params?: InvoiceQueueQueryParams
  ): Promise<PaginatedQueueInvoicesResponse> {
    const queryString = buildInvoiceQueryString(params);
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_INVOICES}${queryString ? `?${queryString}` : ""}`;
    return apiGet<PaginatedQueueInvoicesResponse>(url);
  },

  async getContractQueue(
    params?: ContractQueueQueryParams
  ): Promise<PaginatedQueueContractsResponse> {
    const queryString = buildContractQueryString(params);
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_CONTRACTS}${queryString ? `?${queryString}` : ""}`;
    return apiGet<PaginatedQueueContractsResponse>(url);
  },

  async getQueueStats(): Promise<QueueStats> {
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_STATS}`;
    return apiGet<QueueStats>(url);
  },

  async sendManual(dto: ManualSendDto): Promise<ManualSendResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_SEND}`;
    return apiPost<ManualSendResponse>(url, dto);
  },

  async preview(params: QueuePreviewParams): Promise<QueuePreviewResponse> {
    const qs = new URLSearchParams({
      type: params.type,
      id: params.id,
      channel: params.channel,
    }).toString();
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_PREVIEW}?${qs}`;
    return apiGet<QueuePreviewResponse>(url);
  },
};
