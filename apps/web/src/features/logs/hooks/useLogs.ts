import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLogs,
  fetchLogById,
  createLog,
  markReminderCompleted,
  logsKeys,
} from "../api/logsApi";
import type { LogQueryParams, LogsResponse, Log, CreateLogInput } from "../types";

// Query keys re-export
export { logsKeys };

// Logları getir
export function useLogs(params: LogQueryParams = {}) {
  return useQuery<LogsResponse, Error>({
    queryKey: logsKeys.list(params),
    queryFn: () => fetchLogs(params),
    staleTime: 1000 * 60 * 1, // 1 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
    enabled: !!(params.customerId && params.contextType && params.contextId),
  });
}

// Tek log getir
export function useLog(id: string | null) {
  return useQuery<Log, Error>({
    queryKey: logsKeys.detail(id || ""),
    queryFn: () => fetchLogById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Log oluştur
export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation<Log, Error, CreateLogInput>({
    mutationFn: createLog,
    onSuccess: (_, variables) => {
      // Ilgili context'in log listesini yenile
      queryClient.invalidateQueries({
        queryKey: logsKeys.list({
          customerId: variables.customerId,
          contextType: variables.contextType,
          contextId: variables.contextId,
        }),
      });
    },
  });
}

// Hatırlatmayı tamamlandı olarak işaretle
export function useMarkReminderCompleted() {
  const queryClient = useQueryClient();

  return useMutation<Log, Error, string>({
    mutationFn: markReminderCompleted,
    onSuccess: () => {
      // Tüm log listelerini yenile
      queryClient.invalidateQueries({ queryKey: logsKeys.lists() });
    },
  });
}
