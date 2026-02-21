import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getInvoiceCaptcha,
  viewInvoicePdf,
  type CaptchaResponse,
  type InvoicePdfResponse,
  type VerifyCaptchaInput,
} from "../api/invoiceViewApi";

export const invoiceViewKeys = {
  all: ["invoice-view"] as const,
  captcha: (invoiceUuid: string) => [...invoiceViewKeys.all, "captcha", invoiceUuid] as const,
};

export function useInvoiceCaptcha(invoiceUuid: string | null) {
  return useQuery<CaptchaResponse, Error>({
    queryKey: invoiceViewKeys.captcha(invoiceUuid ?? ""),
    queryFn: () => getInvoiceCaptcha(invoiceUuid!),
    enabled: !!invoiceUuid,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useViewInvoicePdf(invoiceUuid: string) {
  return useMutation<InvoicePdfResponse, Error, VerifyCaptchaInput>({
    mutationFn: (data) => viewInvoicePdf(invoiceUuid, data),
  });
}
