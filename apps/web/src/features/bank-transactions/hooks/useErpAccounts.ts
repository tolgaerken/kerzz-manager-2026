import { useQuery } from "@tanstack/react-query";
import { fetchErpAccounts, fetchErpGlAccounts } from "../api";
import { BANK_TRANSACTIONS_CONSTANTS } from "../constants";

const { QUERY_KEYS } = BANK_TRANSACTIONS_CONSTANTS;

export function useErpAccounts(companyId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ERP_ACCOUNTS, companyId],
    queryFn: () => fetchErpAccounts(companyId),
    staleTime: 1000 * 60 * 10, // 10 dakika
    refetchOnWindowFocus: false,
    enabled: !!companyId,
  });
}

export function useErpGlAccounts(companyId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ERP_GL_ACCOUNTS, companyId],
    queryFn: () => fetchErpGlAccounts(companyId),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    enabled: !!companyId,
  });
}
