import { useQuery } from "@tanstack/react-query";
import {
  fetchAllUninvoicedItems,
  fetchUninvoicedItemsByContract,
} from "../api/uninvoicedItemsApi";
import type { DateRangeFilter } from "../types/uninvoiced-items.types";

/** Query key'leri */
export const uninvoicedItemsKeys = {
  all: (dateRange?: DateRangeFilter) => ["uninvoiced-items", dateRange] as const,
  byContract: (contractId: string) =>
    ["uninvoiced-items", "contract", contractId] as const,
};

/**
 * Tüm faturaya dahil edilmemiş kalemleri getirir.
 * @param dateRange - Tarih aralığı filtresi (en az biri gerekli)
 */
export function useAllUninvoicedItems(dateRange?: DateRangeFilter) {
  // Tarih aralığı seçilmeden sorgu yapma
  const hasDateFilter = !!(dateRange?.startDate || dateRange?.endDate);

  return useQuery({
    queryKey: uninvoicedItemsKeys.all(dateRange),
    queryFn: () => fetchAllUninvoicedItems(dateRange),
    enabled: hasDateFilter,
  });
}

/**
 * Belirli bir kontrat için faturaya dahil edilmemiş kalemleri getirir.
 */
export function useUninvoicedItemsByContract(contractId: string | undefined) {
  return useQuery({
    queryKey: uninvoicedItemsKeys.byContract(contractId || ""),
    queryFn: () => fetchUninvoicedItemsByContract(contractId!),
    enabled: !!contractId,
  });
}
