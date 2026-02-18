import { useQueries } from "@tanstack/react-query";
import { fetchManagerLogs, managerLogKeys } from "../api/managerLogApi";
import type { EntityLogPanelContext, EntityTabType, LogQueryParams } from "../types";

/** Tab konfigürasyonları - enabled olanlar için count alınır */
const TAB_CONFIGS: { type: EntityTabType; enabled: boolean }[] = [
  { type: "contract", enabled: true },
  { type: "license", enabled: true },
  { type: "invoice", enabled: true },
  { type: "payment-plan", enabled: true },
  { type: "e-transform", enabled: true },
  { type: "collection", enabled: true },
  { type: "technical", enabled: false },
];

/** Context'ten ilgili entity ID'sini al */
function getContextId(
  type: EntityTabType,
  context: EntityLogPanelContext
): string | undefined {
  const idMap: Record<EntityTabType, string | undefined> = {
    contract: context.contractId,
    license: context.licenseId,
    invoice: context.invoiceId,
    "payment-plan": context.paymentPlanId,
    collection: context.collectionId,
    "e-transform": context.eTransformId,
    technical: context.technicalId,
  };
  return idMap[type];
}

export type EntityLogCounts = Record<EntityTabType, number>;

/**
 * Entity Log Panel için her tab'ın log count'unu getirir.
 * Paralel API çağrıları ile optimize edilmiştir.
 */
export function useEntityLogCounts(
  entityContext: EntityLogPanelContext | null
): { counts: EntityLogCounts; isLoading: boolean } {
  const queries = useQueries({
    queries: TAB_CONFIGS.map((tab) => {
      const contextId = entityContext ? getContextId(tab.type, entityContext) : undefined;
      const isCollectionTab = tab.type === "collection";
      
      const shouldFetch =
        !!entityContext &&
        tab.enabled &&
        (isCollectionTab ? !!entityContext.customerId : !!contextId);

      const params: LogQueryParams = {
        customerId: entityContext?.customerId,
        contextType: tab.type,
        contextId: isCollectionTab ? undefined : contextId,
        limit: 1,
      };

      return {
        queryKey: managerLogKeys.list({ ...params, _countOnly: true }),
        queryFn: () => fetchManagerLogs(params),
        enabled: shouldFetch,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
      };
    }),
  });

  const counts: EntityLogCounts = {
    contract: 0,
    license: 0,
    invoice: 0,
    "payment-plan": 0,
    "e-transform": 0,
    collection: 0,
    technical: 0,
  };

  const isLoading = queries.some((q) => q.isLoading);

  queries.forEach((query, index) => {
    const tabType = TAB_CONFIGS[index].type;
    if (query.data?.meta?.total !== undefined) {
      counts[tabType] = query.data.meta.total;
    }
  });

  return { counts, isLoading };
}
