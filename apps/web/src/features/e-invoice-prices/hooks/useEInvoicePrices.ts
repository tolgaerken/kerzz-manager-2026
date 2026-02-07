import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEInvoicePrices,
  createEInvoicePrice,
  updateEInvoicePrice,
  deleteEInvoicePrice,
  bulkUpsertEInvoicePrices,
  deleteCustomerPrices,
} from "../api/eInvoicePricesApi";
import type {
  EInvoicePriceQueryParams,
  EInvoicePricesResponse,
  EInvoicePriceFormData,
} from "../types/eInvoicePrice.types";

export const eInvoicePriceKeys = {
  all: ["e-invoice-prices"] as const,
  lists: () => [...eInvoicePriceKeys.all, "list"] as const,
  list: (params: EInvoicePriceQueryParams) =>
    [...eInvoicePriceKeys.lists(), params] as const,
};

export function useEInvoicePrices(params: EInvoicePriceQueryParams = {}) {
  return useQuery<EInvoicePricesResponse, Error>({
    queryKey: eInvoicePriceKeys.list(params),
    queryFn: () => fetchEInvoicePrices(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateEInvoicePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EInvoicePriceFormData) => createEInvoicePrice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eInvoicePriceKeys.lists(),
      });
    },
  });
}

export function useUpdateEInvoicePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EInvoicePriceFormData>;
    }) => updateEInvoicePrice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eInvoicePriceKeys.lists(),
      });
    },
  });
}

export function useDeleteEInvoicePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEInvoicePrice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eInvoicePriceKeys.lists(),
      });
    },
  });
}

export function useBulkUpsertEInvoicePrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: EInvoicePriceFormData[]) =>
      bulkUpsertEInvoicePrices(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eInvoicePriceKeys.lists(),
      });
    },
  });
}

export function useDeleteCustomerPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerErpId: string) =>
      deleteCustomerPrices(customerErpId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eInvoicePriceKeys.lists(),
      });
    },
  });
}
