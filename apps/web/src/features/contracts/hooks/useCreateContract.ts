import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContract } from "../api";
import type { CreateContractInput } from "../types";
import { CONTRACTS_QUERY_KEY } from "./useContracts";

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractInput) => createContract(data),
    onSuccess: () => {
      // Invalidate contracts query to refetch list
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
    }
  });
}
