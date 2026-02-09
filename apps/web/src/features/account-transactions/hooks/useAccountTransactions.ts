import { useQuery } from "@tanstack/react-query";
import { fetchAccountTransactions } from "../api";
import { ACCOUNT_TRANSACTIONS_CONSTANTS } from "../constants/accountTransactions.constants";
import type { AccountTransactionsQueryParams } from "../types";

export function useAccountTransactions(
  accountId: string,
  params: AccountTransactionsQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: [
      ACCOUNT_TRANSACTIONS_CONSTANTS.QUERY_KEYS.TRANSACTIONS,
      accountId,
      params,
    ],
    queryFn: () => fetchAccountTransactions(accountId, params),
    enabled: enabled && !!accountId,
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}
