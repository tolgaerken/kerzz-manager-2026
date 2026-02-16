import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContract } from "../api";
import { CONTRACTS_QUERY_KEY } from "./useContracts";

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
    }
  });
}
