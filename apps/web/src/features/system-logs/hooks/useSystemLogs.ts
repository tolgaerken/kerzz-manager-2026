import { useQuery } from "@tanstack/react-query";
import { fetchSystemLogs, fetchSystemLogById } from "../api/systemLogsApi";
import type { SystemLogQueryParams, SystemLogsResponse, SystemLog } from "../types";

/** Query keys */
export const systemLogsKeys = {
  all: ["system-logs"] as const,
  lists: () => [...systemLogsKeys.all, "list"] as const,
  list: (params: SystemLogQueryParams) => [...systemLogsKeys.lists(), params] as const,
  details: () => [...systemLogsKeys.all, "detail"] as const,
  detail: (id: string) => [...systemLogsKeys.details(), id] as const,
};

/** Sistem loglarını getir */
export function useSystemLogs(params: SystemLogQueryParams = {}) {
  return useQuery<SystemLogsResponse, Error>({
    queryKey: systemLogsKeys.list(params),
    queryFn: () => fetchSystemLogs(params),
    staleTime: 1000 * 30, // 30 saniye
    gcTime: 1000 * 60 * 5, // 5 dakika
    refetchInterval: 1000 * 60, // Her dakika otomatik yenile
  });
}

/** Tek log getir */
export function useSystemLog(id: string | null) {
  return useQuery<SystemLog, Error>({
    queryKey: systemLogsKeys.detail(id || ""),
    queryFn: () => fetchSystemLogById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
