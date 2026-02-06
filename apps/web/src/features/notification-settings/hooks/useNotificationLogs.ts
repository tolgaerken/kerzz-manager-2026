import { useQuery } from "@tanstack/react-query";
import { notificationLogsApi } from "../api";
import type { NotificationLogQueryParams } from "../types";

const QUERY_KEY = "notification-logs";

export function useNotificationLogs(params?: NotificationLogQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => notificationLogsApi.getAll(params),
  });
}

export function useNotificationLog(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => notificationLogsApi.getById(id),
    enabled: !!id,
  });
}
