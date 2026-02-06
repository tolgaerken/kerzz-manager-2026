import { useQuery } from "@tanstack/react-query";
import { fetchAutoPaymentTokens } from "../api/automatedPaymentsApi";
import type {
  AutoPaymentQueryParams,
  AutoPaymentTokensResponse,
} from "../types/automatedPayment.types";

export const autoPaymentKeys = {
  all: ["automated-payments"] as const,
  lists: () => [...autoPaymentKeys.all, "list"] as const,
  list: (params: AutoPaymentQueryParams) =>
    [...autoPaymentKeys.lists(), params] as const,
  plans: () => [...autoPaymentKeys.all, "plans"] as const,
  plan: (erpId: string) => [...autoPaymentKeys.plans(), erpId] as const,
  cards: () => [...autoPaymentKeys.all, "cards"] as const,
  card: (customerId: string) =>
    [...autoPaymentKeys.cards(), customerId] as const,
};

export function useAutoPaymentTokens(
  params: AutoPaymentQueryParams = {}
) {
  return useQuery<AutoPaymentTokensResponse, Error>({
    queryKey: autoPaymentKeys.list(params),
    queryFn: () => fetchAutoPaymentTokens(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}
