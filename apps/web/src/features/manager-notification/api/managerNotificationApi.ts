import { MANAGER_NOTIFICATION_CONSTANTS } from "../constants/manager-notification.constants";
import type {
  ManagerNotificationQueryParams,
  ManagerNotificationsResponse,
  ManagerNotification,
  ManagerNotificationUnreadCountResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = MANAGER_NOTIFICATION_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: ManagerNotificationQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.userId) searchParams.set("userId", params.userId);
  if (params.read !== undefined) searchParams.set("read", params.read.toString());
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

// Query key factory
export const managerNotificationKeys = {
  all: ["manager-notifications"] as const,
  lists: () => [...managerNotificationKeys.all, "list"] as const,
  list: (params: ManagerNotificationQueryParams) => [...managerNotificationKeys.lists(), params] as const,
  unreadCount: (userId: string) => [...managerNotificationKeys.all, "unreadCount", userId] as const,
};

// Bildirimleri getir
export async function fetchManagerNotifications(
  params: ManagerNotificationQueryParams = {}
): Promise<ManagerNotificationsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ManagerNotificationsResponse>(response);
}

// Okunmamış bildirim sayısını getir
export async function fetchManagerNotificationUnreadCount(
  userId: string
): Promise<ManagerNotificationUnreadCountResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}?userId=${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ManagerNotificationUnreadCountResponse>(response);
}

// Bildirimi okundu olarak işaretle
export async function markManagerNotificationAsRead(
  id: string
): Promise<ManagerNotification> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS}/${id}/read`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<ManagerNotification>(response);
}

// Tüm bildirimleri okundu olarak işaretle
export async function markAllManagerNotificationsAsRead(
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
