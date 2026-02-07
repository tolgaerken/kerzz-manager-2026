import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchManagerNotifications,
  fetchManagerNotificationUnreadCount,
  markManagerNotificationAsRead,
  markAllManagerNotificationsAsRead,
  managerNotificationKeys,
} from "../api/managerNotificationApi";
import type {
  ManagerNotificationQueryParams,
  ManagerNotificationsResponse,
  ManagerNotification,
  ManagerNotificationUnreadCountResponse,
} from "../types";

// Query keys re-export
export { managerNotificationKeys };

// Bildirimleri getir
export function useManagerNotifications(params: ManagerNotificationQueryParams = {}) {
  return useQuery<ManagerNotificationsResponse, Error>({
    queryKey: managerNotificationKeys.list(params),
    queryFn: () => fetchManagerNotifications(params),
    staleTime: 1000 * 30, // 30 saniye
    gcTime: 1000 * 60 * 5, // 5 dakika
    enabled: !!params.userId,
  });
}

// Okunmamış bildirim sayısını getir
export function useManagerNotificationUnreadCount(userId: string | null) {
  return useQuery<ManagerNotificationUnreadCountResponse, Error>({
    queryKey: managerNotificationKeys.unreadCount(userId || ""),
    queryFn: () => fetchManagerNotificationUnreadCount(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 saniye
    refetchInterval: 1000 * 60, // Her 1 dakikada bir yenile
  });
}

// Bildirimi okundu olarak işaretle
export function useMarkManagerNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<ManagerNotification, Error, { id: string; userId: string }>({
    mutationFn: ({ id }) => markManagerNotificationAsRead(id),
    onSuccess: (_, variables) => {
      // Bildirimleri ve sayıyı yenile
      queryClient.invalidateQueries({ queryKey: managerNotificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: managerNotificationKeys.unreadCount(variables.userId),
      });
    },
  });
}

// Tüm bildirimleri okundu olarak işaretle
export function useMarkAllManagerNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ modifiedCount: number }, Error, string>({
    mutationFn: markAllManagerNotificationsAsRead,
    onSuccess: (_, userId) => {
      // Bildirimleri ve sayıyı yenile
      queryClient.invalidateQueries({ queryKey: managerNotificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: managerNotificationKeys.unreadCount(userId),
      });
    },
  });
}
