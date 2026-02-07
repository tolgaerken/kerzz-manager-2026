import { useQuery } from "@tanstack/react-query";
import { fetchBankTransactions } from "../api";
import { BANK_TRANSACTIONS_CONSTANTS } from "../constants";
import type { BankTransactionQueryParams } from "../types";

const { QUERY_KEYS } = BANK_TRANSACTIONS_CONSTANTS;

export function useBankTransactions(params: BankTransactionQueryParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.BANK_TRANSACTIONS, params],
    queryFn: () => fetchBankTransactions(params),
    staleTime: 1000 * 60 * 2, // 2 dakika
    refetchOnWindowFocus: false,
    enabled: !!(params.startDate && params.endDate),
  });
}
