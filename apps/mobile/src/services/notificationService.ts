/**
 * Notification API service
 */

import { apiClient } from "../lib/apiClient";
import { NOTIFICATION_ENDPOINTS } from "@kerzz/shared";
import type {
  ManagerNotification,
  ManagerNotificationListResponse,
  UnreadCountResponse,
} from "@kerzz/shared";

export interface NotificationListParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const notificationService = {
  /**
   * Get notifications list
   */
  getNotifications: async (
    params: NotificationListParams = {}
  ): Promise<ManagerNotificationListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));
    if (params.isRead !== undefined)
      queryParams.set("isRead", String(params.isRead));

    const query = queryParams.toString();
    const endpoint = query
      ? `${NOTIFICATION_ENDPOINTS.LIST}?${query}`
      : NOTIFICATION_ENDPOINTS.LIST;

    return apiClient.get<ManagerNotificationListResponse>(endpoint);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<UnreadCountResponse>(
      NOTIFICATION_ENDPOINTS.UNREAD_COUNT
    );
    return response.count;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<ManagerNotification> => {
    const endpoint = NOTIFICATION_ENDPOINTS.MARK_READ.replace(
      ":id",
      notificationId
    );
    return apiClient.patch<ManagerNotification>(endpoint);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },
};
