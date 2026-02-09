import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPipelineLogs, managerLogKeys } from "../api/managerLogApi";
import type { PipelineLogsResponse } from "../types";

/**
 * Pipeline loglarını getir (lead/offer/sale zinciri)
 * @param pipelineRef - Pipeline referans numarası
 */
export function usePipelineLogs(pipelineRef: string | null | undefined) {
  return useQuery<PipelineLogsResponse, Error>({
    queryKey: managerLogKeys.pipeline(pipelineRef || ""),
    queryFn: () => fetchPipelineLogs(pipelineRef!),
    enabled: !!pipelineRef,
    staleTime: 1000 * 60 * 1, // 1 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
  });
}

/**
 * Pipeline loglarını invalidate et
 */
export function useInvalidatePipelineLogs() {
  const queryClient = useQueryClient();

  return (pipelineRef: string) => {
    queryClient.invalidateQueries({
      queryKey: managerLogKeys.pipeline(pipelineRef),
    });
  };
}
