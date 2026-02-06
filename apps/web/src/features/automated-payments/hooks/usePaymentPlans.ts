import { useQuery } from "@tanstack/react-query";
import { fetchPaymentPlans } from "../api/automatedPaymentsApi";
import { autoPaymentKeys } from "./useAutoPaymentTokens";
import type { PaymentPlanItem } from "../types/automatedPayment.types";

export function usePaymentPlans(erpId: string | null) {
  return useQuery<PaymentPlanItem[], Error>({
    queryKey: autoPaymentKeys.plan(erpId ?? ""),
    queryFn: () => fetchPaymentPlans(erpId!),
    enabled: !!erpId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}
