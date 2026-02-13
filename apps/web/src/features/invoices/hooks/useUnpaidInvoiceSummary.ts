import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchUnpaidInvoiceSummaryByErp } from "../api/invoicesApi";
import type { UnpaidSummaryByErpItem } from "../types";

// Query key
export const unpaidSummaryKeys = {
  all: ["invoices", "unpaid-summary"] as const,
  byErp: () => [...unpaidSummaryKeys.all, "by-erp"] as const
};

/**
 * Müşteri bazında ödenmemiş fatura özeti
 * erpId (CariKodu) bazında gruplar
 */
export function useUnpaidInvoiceSummaryByErp() {
  const query = useQuery<UnpaidSummaryByErpItem[], Error>({
    queryKey: unpaidSummaryKeys.byErp(),
    queryFn: fetchUnpaidInvoiceSummaryByErp,
    staleTime: 1000 * 60, // 1 dakika (erp-balances ile uyumlu)
    gcTime: 1000 * 60 * 10 // 10 dakika
  });

  // Map olarak erişim için
  const unpaidMap = useMemo(() => {
    const map = new Map<string, { count: number; totalAmount: number }>();
    if (query.data) {
      for (const item of query.data) {
        map.set(item.erpId, { count: item.count, totalAmount: item.totalAmount });
      }
    }
    return map;
  }, [query.data]);

  return {
    ...query,
    unpaidMap
  };
}
