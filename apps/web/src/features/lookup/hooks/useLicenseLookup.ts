import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLicenseLookup } from "../api/lookupApi";
import { LOOKUP_QUERY_KEYS } from "../constants";
import type { LicenseLookupItem } from "../types/lookup.types";

interface UseLicenseLookupOptions {
  enabled?: boolean;
}

/**
 * Uygulama genelinde lisans lookup verisini sağlar.
 *
 * - Uygulama açılışında bir kez çekilir, change stream ile güncellenir.
 * - staleTime: Infinity — güncelleme change stream invalidation ile olur.
 * - licenseMap: _id ve id ile O(1) erişim.
 * - searchLicenses: client-side arama (autocomplete için).
 */
export function useLicenseLookup(options: UseLicenseLookupOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery<LicenseLookupItem[], Error>({
    queryKey: LOOKUP_QUERY_KEYS.LICENSES,
    queryFn: fetchLicenseLookup,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled
  });

  const licenses = query.data ?? [];

  /** _id ve id ile erişilebilen Map */
  const licenseMap = useMemo(() => {
    const map = new Map<string, LicenseLookupItem>();
    for (const l of licenses) {
      if (l._id) map.set(l._id, l);
      if (l.id) {
        const trimmed = l.id.toString().trim();
        if (trimmed) map.set(trimmed, l);
      }
    }
    return map;
  }, [licenses]);

  /** Client-side arama (autocomplete bileşenleri için) */
  const searchLicenses = useCallback(
    (term: string, limit = 20): LicenseLookupItem[] => {
      if (!term) return licenses.slice(0, limit);
      const lower = term.toLowerCase();
      const results: LicenseLookupItem[] = [];
      for (const l of licenses) {
        if (results.length >= limit) break;
        const match =
          (l.brandName && l.brandName.toLowerCase().includes(lower)) ||
          (l.SearchItem && l.SearchItem.toLowerCase().includes(lower)) ||
          (l.id && l.id.toLowerCase().includes(lower)) ||
          (l.customerName && l.customerName.toLowerCase().includes(lower));
        if (match) results.push(l);
      }
      return results;
    },
    [licenses]
  );

  return {
    ...query,
    licenses,
    licenseMap,
    searchLicenses
  };
}
