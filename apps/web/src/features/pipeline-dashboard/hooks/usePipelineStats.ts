import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchLeadStats, leadKeys } from "../../leads";
import { fetchOfferStats, offerKeys } from "../../offers";
import { fetchSaleStats } from "../../sales";
import { SALES_CONSTANTS } from "../../sales/constants/sales.constants";
import type { PipelineStatsData } from "../types/pipeline-dashboard.types";

export function usePipelineStats() {
  const results = useQueries({
    queries: [
      {
        queryKey: leadKeys.stats(),
        queryFn: () => fetchLeadStats(),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
      },
      {
        queryKey: offerKeys.stats(),
        queryFn: () => fetchOfferStats(),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
      },
      {
        queryKey: [SALES_CONSTANTS.QUERY_KEYS.SALE_STATS, {}],
        queryFn: () => fetchSaleStats({}),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
      },
    ],
  });

  const [leadQuery, offerQuery, saleQuery] = results;

  const data = useMemo<PipelineStatsData>(() => {
    const leads = leadQuery.data;
    const offers = offerQuery.data;
    const sales = saleQuery.data;

    const leadTotal = leads?.total ?? 0;
    const offerTotal = offers?.total ?? 0;
    const saleTotal = sales?.total ?? 0;

    const leadToOfferRate = leadTotal
      ? (leads?.converted ?? 0) / leadTotal * 100
      : 0;
    const offerToSaleRate = offerTotal
      ? (offers?.converted ?? 0) / offerTotal * 100
      : 0;
    const overallConversionRate = leadTotal
      ? saleTotal / leadTotal * 100
      : 0;

    const pipelineValue =
      (leads?.openValue ?? 0) + (offers?.openValue ?? 0);
    const weightedPipelineValue =
      (leads?.weightedValue ?? 0) + (offers?.weightedValue ?? 0);

    return {
      leads,
      offers,
      sales,
      metrics: {
        leadToOfferRate,
        offerToSaleRate,
        overallConversionRate,
        pipelineValue,
        weightedPipelineValue,
      },
    };
  }, [leadQuery.data, offerQuery.data, saleQuery.data]);

  const isLoading = results.some((query) => query.isLoading);
  const isFetching = results.some((query) => query.isFetching);
  const isError = results.some((query) => query.isError);
  const error =
    results.find((query) => query.error)?.error ?? null;

  const refetchAll = () => {
    results.forEach((query) => {
      query.refetch();
    });
  };

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchAll,
  };
}
