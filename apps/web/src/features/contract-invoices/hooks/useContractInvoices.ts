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
    staleTime: 1000 * 60 * 5, // 5 dakika - verier sık değişmez
    gcTime: 1000 * 60 * 15, // 15 dakika
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Bağlantı yenilendiğinde refetch yapma
  });
}

/**
 * Secili planlardan fatura olusturur.
 * Basarili faturalar icin cache'i manuel gunceller, tum listeyi yenilemez.
 */
export function useCreateInvoices() {
  const queryClient = useQueryClient();

  return useMutation<CreateInvoiceResult[], Error, string[]>({
    mutationFn: createInvoices,
    onSuccess: (results) => {
      // Basarili sonuclari filtrele
      const successResults = results.filter((r) => r.success && r.invoiceNo);

      if (successResults.length === 0) {
        // Hicbir fatura olusturulamadiysa invalidate yap
        queryClient.invalidateQueries({
          queryKey: contractInvoicesKeys.lists(),
        });
        return;
      }

      // planId -> result map olustur
      const resultMap = new Map(
        successResults.map((r) => [r.planId, r])
      );

      // Bugunun tarihi (fatura tarihi ve vade tarihi icin)
      const today = new Date().toISOString();
      // Vade tarihi: bugun + 10 gun
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);
      const dueDateStr = dueDate.toISOString();

      // Tum list query'lerini guncelle
      queryClient.setQueriesData<PaymentPlansResponse>(
        { queryKey: contractInvoicesKeys.lists() },
        (oldData) => {
          if (!oldData?.data) return oldData;

          const updatedData = oldData.data.map((plan) => {
            const result = resultMap.get(plan.id);
            if (!result) return plan;

            // Sadece ilgili alanlari guncelle
            return {
              ...plan,
              invoiceNo: result.invoiceNo || plan.invoiceNo,
              uuid: result.uuid || plan.uuid,
              invoiceDate: today,
              dueDate: dueDateStr,
            };
          });

          return {
            ...oldData,
            data: updatedData,
          };
        }
      );
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
