import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchErpBalances,
  fetchErpBalancesByCompany,
  fetchErpBalanceStatus,
  refreshErpBalances,
} from "../api/erpBalancesApi";
import { ERP_BALANCES_CONSTANTS } from "../constants/erpBalances.constants";
import type { ErpBalanceQueryParams } from "../types";

const { QUERY_KEYS } = ERP_BALANCES_CONSTANTS;

export function useErpBalances(params: ErpBalanceQueryParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.ERP_BALANCES, params],
    queryFn: () => fetchErpBalances(params),
    staleTime: 60 * 1000, // 1 dakika
  });
}

export function useErpBalancesByCompany(companyId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.ERP_BALANCES_BY_COMPANY, companyId],
    queryFn: () => fetchErpBalancesByCompany(companyId!),
    enabled: !!companyId,
    staleTime: 60 * 1000,
  });
}

export function useErpBalanceStatus() {
  return useQuery({
    queryKey: [QUERY_KEYS.ERP_BALANCE_STATUS],
    queryFn: () => fetchErpBalanceStatus(),
    staleTime: 30 * 1000,
  });
}

export function useRefreshErpBalances() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refreshErpBalances(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ERP_BALANCES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ERP_BALANCE_STATUS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ERP_BALANCES_BY_COMPANY],
      });
    },
  });
}
