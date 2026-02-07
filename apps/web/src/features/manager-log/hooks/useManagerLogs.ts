import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchManagerLogs,
  fetchManagerLogById,
  createManagerLog,
  markManagerLogReminderCompleted,
  managerLogKeys,
} from "../api/managerLogApi";
import type { LogQueryParams, LogsResponse, Log, CreateLogInput } from "../types";

// Query keys re-export
export { managerLogKeys };

// Logları getir
export function useManagerLogs(params: LogQueryParams = {}) {
  return useQuery<LogsResponse, Error>({
    queryKey: managerLogKeys.list(params),
    queryFn: () => fetchManagerLogs(params),
    staleTime: 1000 * 60 * 1, // 1 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
    enabled: !!(params.customerId && params.contextType && params.contextId),
  });
}

// Tek log getir
export function useManagerLog(id: string | null) {
  return useQuery<Log, Error>({
    queryKey: managerLogKeys.detail(id || ""),
    queryFn: () => fetchManagerLogById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Log oluştur
export function useCreateManagerLog() {
  const queryClient = useQueryClient();

  return useMutation<Log, Error, CreateLogInput>({
    mutationFn: createManagerLog,
    onSuccess: (_, variables) => {
      // Ilgili context'in log listesini yenile
      queryClient.invalidateQueries({
        queryKey: managerLogKeys.list({
          customerId: variables.customerId,
          contextType: variables.contextType,
          contextId: variables.contextId,
        }),
      });
    },
  });
}

// Hatırlatmayı tamamlandı olarak işaretle
export function useMarkManagerLogReminderCompleted() {
  const queryClient = useQueryClient();

  return useMutation<Log, Error, string>({
    mutationFn: markManagerLogReminderCompleted,
    onSuccess: () => {
      // Tüm log listelerini yenile
      queryClient.invalidateQueries({ queryKey: managerLogKeys.lists() });
    },
  });
}
