import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from "../api/invoicesApi";
import type {
  InvoiceQueryParams,
  InvoicesResponse,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput
} from "../types";

// Query keys
export const invoicesKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoicesKeys.all, "list"] as const,
  list: (params: InvoiceQueryParams) => [...invoicesKeys.lists(), params] as const,
  details: () => [...invoicesKeys.all, "detail"] as const,
  detail: (id: string) => [...invoicesKeys.details(), id] as const
};

// Faturaları getir
export function useInvoices(params: InvoiceQueryParams = {}) {
  return useQuery<InvoicesResponse, Error>({
    queryKey: invoicesKeys.list(params),
    queryFn: () => fetchInvoices(params),
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 30 // 30 dakika
  });
}

// Tek fatura getir
export function useInvoice(id: string | null) {
  return useQuery<Invoice, Error>({
    queryKey: invoicesKeys.detail(id || ""),
    queryFn: () => fetchInvoiceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
}

// Fatura oluştur
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, CreateInvoiceInput>({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
    }
  });
}

// Fatura güncelle
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, { id: string; data: UpdateInvoiceInput }>({
    mutationFn: ({ id, data }) => updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.detail(variables.id) });
    }
  });
}

// Fatura sil
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
    }
  });
}
