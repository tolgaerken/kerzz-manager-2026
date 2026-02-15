import { useQuery } from "@tanstack/react-query";
import { fetchProratedReport } from "../api/proratedReportApi";
import type { ProratedReportFilter } from "../types/prorated-report.types";

export function useProratedReport(filter?: ProratedReportFilter) {
  return useQuery({
    queryKey: ["prorated-report", filter],
    queryFn: () => fetchProratedReport(filter),
  });
}
