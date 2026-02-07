import { useQuery } from "@tanstack/react-query";
import { fetchErpBankMaps } from "../api";
import { BANK_TRANSACTIONS_CONSTANTS } from "../constants";

const { QUERY_KEYS } = BANK_TRANSACTIONS_CONSTANTS;

export function useErpBankMaps() {
  return useQuery({
    queryKey: [QUERY_KEYS.ERP_BANK_MAPS],
    queryFn: fetchErpBankMaps,
    staleTime: 1000 * 60 * 10, // 10 dakika
    refetchOnWindowFocus: false,
  });
}
