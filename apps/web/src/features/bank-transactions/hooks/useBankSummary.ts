import { useQuery } from "@tanstack/react-query";
import { fetchBankSummary } from "../api";
import { BANK_TRANSACTIONS_CONSTANTS } from "../constants";

const { QUERY_KEYS } = BANK_TRANSACTIONS_CONSTANTS;

export function useBankSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BANK_SUMMARY, startDate, endDate],
    queryFn: () => fetchBankSummary(startDate, endDate),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    enabled: !!(startDate && endDate),
  });
}
