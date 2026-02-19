import { apiDelete, apiGet } from "../../../lib/apiClient";
import type {
  ProratedReportResponse,
  ProratedReportFilter,
  RemoveProratedReportItemResponse,
} from "../types/prorated-report.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export async function fetchProratedReport(
  filter?: ProratedReportFilter
): Promise<ProratedReportResponse> {
  const params = new URLSearchParams();

  if (filter?.paid !== undefined) {
    params.set("paid", String(filter.paid));
  }
  if (filter?.invoiced !== undefined) {
    params.set("invoiced", String(filter.invoiced));
  }
  if (filter?.contractId) {
    params.set("contractId", filter.contractId);
  }

  const qs = params.toString();
  const url = `${API_BASE_URL}/contract-payments/prorated-report${qs ? `?${qs}` : ""}`;
  return apiGet(url);
}

export async function removeProratedReportItem(
  planId: string,
): Promise<RemoveProratedReportItemResponse> {
  const url = `${API_BASE_URL}/contract-payments/prorated-report/${planId}`;
  return apiDelete(url);
}
