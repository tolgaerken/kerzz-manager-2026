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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

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
  if (params.remainingDaysMax != null) searchParams.set("remainingDaysMax", params.remainingDaysMax.toString());
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
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    return handleResponse<PaginatedQueueInvoicesResponse>(response);
  },

  async getContractQueue(
    params?: ContractQueueQueryParams
  ): Promise<PaginatedQueueContractsResponse> {
    const queryString = buildContractQueryString(params);
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_CONTRACTS}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    return handleResponse<PaginatedQueueContractsResponse>(response);
  },

  async getQueueStats(): Promise<QueueStats> {
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_STATS}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    return handleResponse<QueueStats>(response);
  },

  async sendManual(dto: ManualSendDto): Promise<ManualSendResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_SEND}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(dto),
    });
    return handleResponse<ManualSendResponse>(response);
  },

  async preview(params: QueuePreviewParams): Promise<QueuePreviewResponse> {
    const qs = new URLSearchParams({
      type: params.type,
      id: params.id,
      channel: params.channel,
    }).toString();
    const url = `${API_BASE_URL}${ENDPOINTS.QUEUE_PREVIEW}?${qs}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    return handleResponse<QueuePreviewResponse>(response);
  },
};
