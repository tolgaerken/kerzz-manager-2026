import { useQuery } from "@tanstack/react-query";
import { getContractPaymentDetail } from "../api/contractPaymentDetailApi";
import type { ContractPaymentDetailDto } from "../types/contractPaymentDetail.types";

export const contractPaymentDetailKeys = {
  all: ["contract-payment-detail"] as const,
  detail: (linkId: string) => [...contractPaymentDetailKeys.all, linkId] as const,
};

export function useContractPaymentDetail(linkId: string | null) {
  return useQuery<ContractPaymentDetailDto, Error>({
    queryKey: contractPaymentDetailKeys.detail(linkId ?? ""),
    queryFn: () => getContractPaymentDetail(linkId!),
    enabled: !!linkId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}
