import { LOGS_CONSTANTS } from "../constants/logs.constants";
import type {
  NotificationQueryParams,
  NotificationsResponse,
  Notification,
  UnreadCountResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = LOGS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: NotificationQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.userId) searchParams.set("userId", params.userId);
  if (params.read !== undefined) searchParams.set("read", params.read.toString());
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

// Query key factory
export const notificationsKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsKeys.all, "list"] as const,
  list: (params: NotificationQueryParams) => [...notificationsKeys.lists(), params] as const,
  unreadCount: (userId: string) => [...notificationsKeys.all, "unreadCount", userId] as const,
};

// Bildirimleri getir
export async function fetchNotifications(
  params: NotificationQueryParams = {}
): Promise<NotificationsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<NotificationsResponse>(response);
}

// Okunmamış bildirim sayısını getir
export async function fetchUnreadCount(userId: string): Promise<UnreadCountResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}?userId=${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<UnreadCountResponse>(response);
}

// Bildirimi okundu olarak işaretle
export async function markNotificationAsRead(id: string): Promise<Notification> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS}/${id}/read`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Notification>(response);
}

// Tüm bildirimleri okundu olarak işaretle
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ modifiedCount: number }> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS_READ_ALL}?userId=${userId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<{ modifiedCount: number }>(response);
}
