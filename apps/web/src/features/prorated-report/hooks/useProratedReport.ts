import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProratedReport,
  removeProratedReportItem,
} from "../api/proratedReportApi";
import type {
  ProratedReportFilter,
  RemoveProratedReportItemResponse,
} from "../types/prorated-report.types";

const PRORATED_REPORT_QUERY_KEY = "prorated-report";

export function useProratedReport(filter?: ProratedReportFilter) {
  return useQuery({
    queryKey: [PRORATED_REPORT_QUERY_KEY, filter],
    queryFn: () => fetchProratedReport(filter),
  });
}

export function useRemoveProratedReportItem() {
  const queryClient = useQueryClient();

  return useMutation<RemoveProratedReportItemResponse, Error, string>({
    mutationFn: (planId) => removeProratedReportItem(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRORATED_REPORT_QUERY_KEY] });
    },
  });
}
