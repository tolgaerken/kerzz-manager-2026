import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  notificationsKeys,
} from "../api/notificationsApi";
import type {
  NotificationQueryParams,
  NotificationsResponse,
  Notification,
  UnreadCountResponse,
} from "../types";

// Query keys re-export
export { notificationsKeys };

// Bildirimleri getir
export function useNotifications(params: NotificationQueryParams = {}) {
  return useQuery<NotificationsResponse, Error>({
    queryKey: notificationsKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 1000 * 30, // 30 saniye
    gcTime: 1000 * 60 * 5, // 5 dakika
    enabled: !!params.userId,
  });
}

// Okunmamış bildirim sayısını getir
export function useUnreadNotificationCount(userId: string | null) {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: notificationsKeys.unreadCount(userId || ""),
    queryFn: () => fetchUnreadCount(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 saniye
    refetchInterval: 1000 * 60, // Her 1 dakikada bir yenile
  });
}

// Bildirimi okundu olarak işaretle
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<Notification, Error, { id: string; userId: string }>({
    mutationFn: ({ id }) => markNotificationAsRead(id),
    onSuccess: (_, variables) => {
      // Bildirimleri ve sayıyı yenile
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.unreadCount(variables.userId),
      });
    },
  });
}

// Tüm bildirimleri okundu olarak işaretle
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ modifiedCount: number }, Error, string>({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (_, userId) => {
      // Bildirimleri ve sayıyı yenile
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.unreadCount(userId),
      });
    },
  });
}
