import { apiGet } from "../../../lib/apiClient";
import type { UninvoicedItemsSummary, DateRangeFilter } from "../types/uninvoiced-items.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

/**
 * Tüm kontratlardaki faturaya dahil edilmemiş kalemleri getirir.
 * @param dateRange - Opsiyonel tarih aralığı filtresi
 */
export async function fetchAllUninvoicedItems(
  dateRange?: DateRangeFilter
): Promise<UninvoicedItemsSummary> {
  const params = new URLSearchParams();

  if (dateRange?.startDate) {
    params.set("startDate", dateRange.startDate);
  }
  if (dateRange?.endDate) {
    params.set("endDate", dateRange.endDate);
  }

  const qs = params.toString();
  const url = `${API_BASE_URL}/contract-payments/uninvoiced-items${qs ? `?${qs}` : ""}`;
  return apiGet(url);
}

/**
 * Belirli bir kontrat için faturaya dahil edilmemiş kalemleri getirir.
 */
export async function fetchUninvoicedItemsByContract(
  contractId: string
): Promise<UninvoicedItemsSummary> {
  const url = `${API_BASE_URL}/contract-payments/uninvoiced-items/${contractId}`;
  return apiGet(url);
}
