import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SALES_CONSTANTS } from "../constants/sales.constants";
import {
  fetchSales,
  fetchSaleById,
  createSale,
  updateSale,
  deleteSale,
  calculateSaleTotals,
  approveSale,
  revertSale,
  fetchSaleStats,
  requestSaleApproval,
  fetchPendingApprovals,
  rejectSale,
  bulkApproveSales,
} from "../api/salesApi";
import type {
  SaleQueryParams,
  SalesResponse,
  Sale,
  SaleStats,
  CreateSaleInput,
  UpdateSaleInput,
  ApprovalRequestResult,
  ApprovalActionResult,
} from "../types/sale.types";

const { QUERY_KEYS } = SALES_CONSTANTS;

export function useSales(params: SaleQueryParams = {}) {
  return useQuery<SalesResponse, Error>({
    queryKey: [QUERY_KEYS.SALES, params],
    queryFn: () => fetchSales(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useSale(id: string) {
  return useQuery<Sale, Error>({
    queryKey: [QUERY_KEYS.SALE, id],
    queryFn: () => fetchSaleById(id),
    enabled: !!id,
  });
}

export function useSaleStats(params: SaleQueryParams = {}) {
  return useQuery<SaleStats, Error>({
    queryKey: [QUERY_KEYS.SALE_STATS, params],
    queryFn: () => fetchSaleStats(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSaleInput }) =>
      updateSale(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
    },
  });
}

export function useApproveSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      approveSale(id, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_APPROVALS] });
    },
  });
}

export function useCalculateSaleTotals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calculateSaleTotals(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE, id] });
    },
  });
}

export function useRevertSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revertSale(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
    },
  });
}

// ==================== ONAY AKIŞI HOOK'LARI ====================

/**
 * Toplu onay isteği gönderme hook'u
 */
export function useRequestSaleApproval() {
  const queryClient = useQueryClient();

  return useMutation<
    ApprovalRequestResult,
    Error,
    { saleIds: string[]; note?: string }
  >({
    mutationFn: ({ saleIds, note }) => requestSaleApproval(saleIds, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_APPROVALS] });
    },
  });
}

/**
 * Bekleyen onayları listeleme hook'u
 */
export function usePendingApprovals() {
  return useQuery<Sale[], Error>({
    queryKey: [QUERY_KEYS.PENDING_APPROVALS],
    queryFn: () => fetchPendingApprovals(),
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Satış reddetme hook'u
 */
export function useRejectSale() {
  const queryClient = useQueryClient();

  return useMutation<
    ApprovalActionResult,
    Error,
    { id: string; reason: string }
  >({
    mutationFn: ({ id, reason }) => rejectSale(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_APPROVALS] });
    },
  });
}

/**
 * Toplu onay işlemi hook'u
 */
export function useBulkApproveSales() {
  const queryClient = useQueryClient();

  return useMutation<
    ApprovalRequestResult,
    Error,
    { saleIds: string[]; note?: string }
  >({
    mutationFn: ({ saleIds, note }) => bulkApproveSales(saleIds, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALE_STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_APPROVALS] });
    },
  });
}
