import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkContract } from "../api";
import { CONTRACTS_QUERY_KEY } from "./useContracts";

export function useCheckContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => checkContract(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["contract-payments"] });
    }
  });
}
