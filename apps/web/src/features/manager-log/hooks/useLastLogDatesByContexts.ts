import { useQuery } from "@tanstack/react-query";
import {
  fetchLastLogDatesByContexts,
  managerLogKeys,
  type LastByContextsResponse,
  type LastByContextsParams,
  type ContextQuery,
} from "../api/managerLogApi";

// Re-export types for convenience
export type { LastByContextsParams, ContextQuery, LastByContextsResponse };

/**
 * Birden fazla context için son log tarihlerini batch olarak getirir.
 * Çoklu context tipi ve legacy log desteği sağlar.
 *
 * @param params - Sorgu parametreleri
 * @returns { data: Record<entityId, ISO date string>, isLoading, error }
 *
 * @example
 * // Payment plan ve contract loglarını sorgula
 * const { data } = useLastLogDatesByContexts({
 *   contexts: [
 *     { type: "payment-plan", ids: planIds },
 *     { type: "contract", ids: contractIds },
 *   ],
 *   legacyContractIds: contractIds,
 *   includeLegacy: true,
 * });
 *
 * @example
 * // Sadece customer bazlı legacy log sorgula
 * const { data } = useLastLogDatesByContexts({
 *   contexts: [],
 *   legacyCustomerIds: customerIds,
 *   includeLegacy: true,
 *   groupByField: "customerId",
 * });
 */
export function useLastLogDatesByContexts(params: LastByContextsParams) {
  // Query'nin çalışması için en az bir ID olmalı
  const hasContextIds = params.contexts.some((c) => c.ids.length > 0);
  const hasLegacyIds =
    (params.legacyContractIds && params.legacyContractIds.length > 0) ||
    (params.legacyCustomerIds && params.legacyCustomerIds.length > 0);

  const enabled = hasContextIds || hasLegacyIds;

  return useQuery<LastByContextsResponse, Error>({
    queryKey: managerLogKeys.lastByContexts(params),
    queryFn: () => fetchLastLogDatesByContexts(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
  });
}
