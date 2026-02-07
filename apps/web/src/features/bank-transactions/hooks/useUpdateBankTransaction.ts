import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBankTransaction } from "../api";
import { BANK_TRANSACTIONS_CONSTANTS } from "../constants";
import type { UpdateBankTransactionInput } from "../types";

const { QUERY_KEYS } = BANK_TRANSACTIONS_CONSTANTS;

export function useUpdateBankTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankTransactionInput }) =>
      updateBankTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BANK_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BANK_SUMMARY],
      });
    },
  });
}
