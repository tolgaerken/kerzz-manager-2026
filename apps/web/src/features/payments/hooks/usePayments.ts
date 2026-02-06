import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPaymentLinks,
  getPaymentInfo,
  createPaymentLink,
  sendPaymentLinkNotification
} from "../api/paymentsApi";
import type {
  PaymentLinkQueryParams,
  PaymentLinksResponse,
  PaymentInfo,
  CreatePaymentLinkInput,
  CreatePaymentLinkResponse,
  NotifyResponse
} from "../types/payment.types";

export const paymentsKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentsKeys.all, "list"] as const,
  list: (params: PaymentLinkQueryParams) =>
    [...paymentsKeys.lists(), params] as const,
  details: () => [...paymentsKeys.all, "detail"] as const,
  detail: (linkId: string) => [...paymentsKeys.details(), linkId] as const
};

export function usePaymentLinks(params: PaymentLinkQueryParams = {}) {
  return useQuery<PaymentLinksResponse, Error>({
    queryKey: paymentsKeys.list(params),
    queryFn: () => fetchPaymentLinks(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10
  });
}

export function usePaymentInfo(linkId: string | null) {
  return useQuery<PaymentInfo, Error>({
    queryKey: paymentsKeys.detail(linkId ?? ""),
    queryFn: () => getPaymentInfo(linkId!),
    enabled: !!linkId
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation<
    CreatePaymentLinkResponse,
    Error,
    CreatePaymentLinkInput
  >({
    mutationFn: createPaymentLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() });
    }
  });
}

export function useSendPaymentLinkNotification() {
  const queryClient = useQueryClient();

  return useMutation<NotifyResponse, Error, string>({
    mutationFn: sendPaymentLinkNotification,
    onSuccess: (_, linkId) => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(linkId) });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() });
    }
  });
}
