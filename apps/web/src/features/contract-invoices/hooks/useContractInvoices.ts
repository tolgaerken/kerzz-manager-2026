import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPaymentPlans,
  createInvoices,
  checkContracts,
} from "../api/contractInvoicesApi";
import type {
  PaymentPlansQueryParams,
  PaymentPlansResponse,
  CreateInvoiceResult,
  CheckContractResult,
} from "../types";

// Query keys
export const contractInvoicesKeys = {
  all: ["contract-invoices"] as const,
  lists: () => [...contractInvoicesKeys.all, "list"] as const,
  list: (params: PaymentPlansQueryParams) =>
    [...contractInvoicesKeys.lists(), params] as const,
};

/**
 * Odeme planlarini getirir.
 */
export function usePaymentPlans(
  params: PaymentPlansQueryParams,
  enabled = true,
) {
  return useQuery<PaymentPlansResponse, Error>({
    queryKey: contractInvoicesKeys.list(params),
    queryFn: () => fetchPaymentPlans(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
    refetchOnWindowFocus: false,
  });
}

/**
 * Secili planlardan fatura olusturur.
 */
export function useCreateInvoices() {
  const queryClient = useQueryClient();

  return useMutation<CreateInvoiceResult[], Error, string[]>({
    mutationFn: createInvoices,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractInvoicesKeys.lists(),
      });
    },
  });
}

/**
 * Secili planlarin kontratlarini kontrol eder.
 */
export function useCheckContracts() {
  const queryClient = useQueryClient();

  return useMutation<CheckContractResult[], Error, string[]>({
    mutationFn: checkContracts,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractInvoicesKeys.lists(),
      });
    },
  });
}
