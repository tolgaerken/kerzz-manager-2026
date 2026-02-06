import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collectPayment,
  deleteAutoPaymentToken,
  deleteCard,
} from "../api/automatedPaymentsApi";
import { autoPaymentKeys } from "./useAutoPaymentTokens";
import type {
  CollectPaymentInput,
  CollectPaymentResponse,
} from "../types/automatedPayment.types";

export function useCollectPayment() {
  const queryClient = useQueryClient();

  return useMutation<CollectPaymentResponse, Error, CollectPaymentInput>({
    mutationFn: collectPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: autoPaymentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: autoPaymentKeys.plans(),
      });
    },
  });
}

export function useDeleteToken() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteAutoPaymentToken,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: autoPaymentKeys.lists(),
      });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { customerId: string; ctoken: string }
  >({
    mutationFn: ({ customerId, ctoken }) =>
      deleteCard(customerId, ctoken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: autoPaymentKeys.cards(),
      });
    },
  });
}
