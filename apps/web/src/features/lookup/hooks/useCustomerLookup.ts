import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerLookup } from "../api/lookupApi";
import { LOOKUP_QUERY_KEYS } from "../constants";
import type { CustomerLookupItem } from "../types/lookup.types";

interface UseCustomerLookupOptions {
  enabled?: boolean;
}

/**
 * Uygulama genelinde müşteri lookup verisini sağlar.
 *
 * - Uygulama açılışında bir kez çekilir, change stream ile güncellenir.
 * - staleTime: Infinity — güncelleme change stream invalidation ile olur.
 * - customerMap: hem _id hem id ile O(1) erişim.
 * - getCustomerName: customerId'den isim çözümler.
 * - searchCustomers: client-side arama (autocomplete için).
 */
export function useCustomerLookup(options: UseCustomerLookupOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery<CustomerLookupItem[], Error>({
    queryKey: LOOKUP_QUERY_KEYS.CUSTOMERS,
    queryFn: fetchCustomerLookup,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled
  });

  const customers = query.data ?? [];

  /** Hem _id hem id ile erişilebilen Map */
  const customerMap = useMemo(() => {
    const map = new Map<string, CustomerLookupItem>();
    for (const c of customers) {
      if (c._id) map.set(c._id, c);
      if (c.id) {
        const trimmed = c.id.toString().trim();
        if (trimmed) map.set(trimmed, c);
      }
    }
    return map;
  }, [customers]);

  /** customerId'den müşteri adını çözümler */
  const getCustomerName = useCallback(
    (customerId: string | undefined | null): string => {
      if (!customerId) return "-";
      const customer = customerMap.get(customerId.toString().trim());
      if (!customer) return "-";
      return customer.name || customer.companyName || "-";
    },
    [customerMap]
  );

  /** Client-side arama (autocomplete bileşenleri için) */
  const searchCustomers = useCallback(
    (term: string, limit = 20): CustomerLookupItem[] => {
      if (!term) return customers.slice(0, limit);
      const lower = term.toLowerCase();
      const results: CustomerLookupItem[] = [];
      for (const c of customers) {
        if (results.length >= limit) break;
        const matchErpMappings = c.erpMappings?.some(
          (m) => m.erpId && m.erpId.toLowerCase().includes(lower)
        );
        const match =
          (c.name && c.name.toLowerCase().includes(lower)) ||
          (c.companyName && c.companyName.toLowerCase().includes(lower)) ||
          (c.erpId && c.erpId.toLowerCase().includes(lower)) ||
          matchErpMappings ||
          (c.taxNo && c.taxNo.toLowerCase().includes(lower));
        if (match) results.push(c);
      }
      return results;
    },
    [customers]
  );

  return {
    ...query,
    customers,
    customerMap,
    getCustomerName,
    searchCustomers
  };
}
