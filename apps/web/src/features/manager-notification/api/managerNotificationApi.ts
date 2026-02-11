import { apiGet, apiPatch } from "../../../lib/apiClient";
import { MANAGER_NOTIFICATION_CONSTANTS } from "../constants/manager-notification.constants";
import type {
  ManagerNotificationQueryParams,
  ManagerNotificationsResponse,
  ManagerNotification,
  ManagerNotificationUnreadCountResponse
} from "../types";

const { API_BASE_URL, ENDPOINTS } = MANAGER_NOTIFICATION_CONSTANTS;

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
  list: (params: ManagerNotificationQueryParams) =>
    [...managerNotificationKeys.lists(), params] as const,
  unreadCount: (userId: string) => [...managerNotificationKeys.all, "unreadCount", userId] as const
};

// Bildirimleri getir
export async function fetchManagerNotifications(
  params: ManagerNotificationQueryParams = {}
): Promise<ManagerNotificationsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS}${queryString ? `?${queryString}` : ""}`;
  return apiGet<ManagerNotificationsResponse>(url);
}

// Okunmamış bildirim sayısını getir
export async function fetchManagerNotificationUnreadCount(
  userId: string
): Promise<ManagerNotificationUnreadCountResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}?userId=${userId}`;
  return apiGet<ManagerNotificationUnreadCountResponse>(url);
}

// Bildirimi okundu olarak işaretle
export async function markManagerNotificationAsRead(id: string): Promise<ManagerNotification> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS}/${id}/read`;
  return apiPatch<ManagerNotification>(url);
}

// Tüm bildirimleri okundu olarak işaretle
export async function markAllManagerNotificationsAsRead(
  userId: string
): Promise<{ modifiedCount: number }> {
  const url = `${API_BASE_URL}${ENDPOINTS.NOTIFICATIONS_READ_ALL}?userId=${userId}`;
  return apiPatch<{ modifiedCount: number }>(url);
}
