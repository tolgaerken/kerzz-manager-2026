import { useQuery } from "@tanstack/react-query";
import { fetchContracts, fetchContractById } from "../api";
import type { ContractQueryParams } from "../types";

export const CONTRACTS_QUERY_KEY = "contracts";

export function useContracts(params: ContractQueryParams = {}) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, params],
    queryFn: () => fetchContracts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });
}

export function useContractById(id: string | undefined) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, id],
    queryFn: () => fetchContractById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
