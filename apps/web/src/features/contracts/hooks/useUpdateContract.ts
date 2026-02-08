import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContract } from "../api";
import type { UpdateContractInput } from "../types";
import { CONTRACTS_QUERY_KEY } from "./useContracts";

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContractInput) => updateContract(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
    }
  });
}
