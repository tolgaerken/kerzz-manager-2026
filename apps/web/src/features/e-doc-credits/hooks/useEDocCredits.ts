import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEDocCredits,
  createEDocCredit,
  updateEDocCredit,
  deleteEDocCredit,
  createInvoiceForCredit,
} from "../api/eDocCreditsApi";
import type {
  EDocCreditQueryParams,
  EDocCreditsResponse,
  EDocCreditFormData,
} from "../types/eDocCredit.types";

export const eDocCreditKeys = {
  all: ["e-doc-credits"] as const,
  lists: () => [...eDocCreditKeys.all, "list"] as const,
  list: (params: EDocCreditQueryParams) =>
    [...eDocCreditKeys.lists(), params] as const,
};

export function useEDocCredits(params: EDocCreditQueryParams = {}) {
  return useQuery<EDocCreditsResponse, Error>({
    queryKey: eDocCreditKeys.list(params),
    queryFn: () => fetchEDocCredits(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateEDocCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EDocCreditFormData) => createEDocCredit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocCreditKeys.lists() });
    },
  });
}

export function useUpdateEDocCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EDocCreditFormData> }) =>
      updateEDocCredit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocCreditKeys.lists() });
    },
  });
}

export function useDeleteEDocCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEDocCredit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocCreditKeys.lists() });
    },
  });
}

export function useCreateInvoiceForCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => createInvoiceForCredit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocCreditKeys.lists() });
    },
  });
}
