import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationQueueApi } from "../api";
import type {
  InvoiceQueueQueryParams,
  ContractQueueQueryParams,
  ManualSendDto,
  QueuePreviewParams,
} from "../types";

const QUERY_KEY = "notification-queue";

export function useInvoiceQueue(params?: InvoiceQueueQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, "invoices", params],
    queryFn: () => notificationQueueApi.getInvoiceQueue(params),
  });
}

export function useContractQueue(params?: ContractQueueQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, "contracts", params],
    queryFn: () => notificationQueueApi.getContractQueue(params),
  });
}

type QueueStatsOptions = {
  enabled?: boolean;
};

export function useQueueStats(options?: QueueStatsOptions) {
  return useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: () => notificationQueueApi.getQueueStats(),
    enabled: options?.enabled ?? true,
  });
}

export function useSendManualNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ManualSendDto) => notificationQueueApi.sendManual(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
    },
  });
}

export function useQueuePreview(params: QueuePreviewParams | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "preview", params],
    queryFn: () => notificationQueueApi.preview(params!),
    enabled: !!params,
  });
}
