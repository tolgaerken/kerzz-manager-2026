import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type {
  NotificationLog,
  NotificationLogQueryParams,
  PaginatedNotificationLogsResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params?: NotificationLogQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  if (params.channel) searchParams.set("channel", params.channel);
  if (params.status) searchParams.set("status", params.status);
  if (params.contextType) searchParams.set("contextType", params.contextType);
  if (params.contextId) searchParams.set("contextId", params.contextId);
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.invoiceId) searchParams.set("invoiceId", params.invoiceId);
  if (params.contractId) searchParams.set("contractId", params.contractId);
  if (params.templateCode) searchParams.set("templateCode", params.templateCode);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

export const notificationLogsApi = {
  async getAll(
    params?: NotificationLogQueryParams
  ): Promise<PaginatedNotificationLogsResponse> {
    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${ENDPOINTS.LOGS}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<PaginatedNotificationLogsResponse>(response);
  },

  async getById(id: string): Promise<NotificationLog> {
    const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/${id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<NotificationLog>(response);
  },
};
