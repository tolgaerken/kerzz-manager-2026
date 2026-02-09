import { useQuery } from "@tanstack/react-query";
import { fetchAccounts } from "../api";
import { ACCOUNT_TRANSACTIONS_CONSTANTS } from "../constants/accountTransactions.constants";
import type { AccountTransactionsQueryParams } from "../types";

export function useAccounts(params: AccountTransactionsQueryParams, enabled = true) {
  return useQuery({
    queryKey: [ACCOUNT_TRANSACTIONS_CONSTANTS.QUERY_KEYS.ACCOUNTS, params],
    queryFn: () => fetchAccounts(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}
