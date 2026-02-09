import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PIPELINE_CONSTANTS } from "../constants/pipeline.constants";
import {
  fetchPipelineProducts,
  createPipelineProduct,
  updatePipelineProduct,
  deletePipelineProduct,
  fetchPipelineLicenses,
  createPipelineLicense,
  updatePipelineLicense,
  deletePipelineLicense,
  fetchPipelineRentals,
  createPipelineRental,
  updatePipelineRental,
  deletePipelineRental,
  fetchPipelinePayments,
  createPipelinePayment,
  updatePipelinePayment,
  deletePipelinePayment,
  calculateTotals,
  convertLeadToOffer,
  convertOfferToSale,
  revertLeadToOffer,
} from "../api/pipelineApi";
import type { PipelineProduct, PipelineLicense, PipelineRental, PipelinePayment } from "../types/pipeline.types";

const { QUERY_KEYS } = PIPELINE_CONSTANTS;

// --- Products ---
export function usePipelineProducts(parentId: string, parentType: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PIPELINE_PRODUCTS, parentId, parentType],
    queryFn: () => fetchPipelineProducts(parentId, parentType),
    enabled: !!parentId,
  });
}

export function useCreatePipelineProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PipelineProduct>) => createPipelineProduct(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_PRODUCTS, vars.parentId] });
    },
  });
}

export function useUpdatePipelineProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PipelineProduct> }) => updatePipelineProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_PRODUCTS] });
    },
  });
}

export function useDeletePipelineProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePipelineProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_PRODUCTS] });
    },
  });
}

// --- Licenses ---
export function usePipelineLicenses(parentId: string, parentType: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PIPELINE_LICENSES, parentId, parentType],
    queryFn: () => fetchPipelineLicenses(parentId, parentType),
    enabled: !!parentId,
  });
}

export function useCreatePipelineLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PipelineLicense>) => createPipelineLicense(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_LICENSES, vars.parentId] });
    },
  });
}

export function useUpdatePipelineLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PipelineLicense> }) => updatePipelineLicense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_LICENSES] });
    },
  });
}

export function useDeletePipelineLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePipelineLicense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_LICENSES] });
    },
  });
}

// --- Rentals ---
export function usePipelineRentals(parentId: string, parentType: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PIPELINE_RENTALS, parentId, parentType],
    queryFn: () => fetchPipelineRentals(parentId, parentType),
    enabled: !!parentId,
  });
}

export function useCreatePipelineRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PipelineRental>) => createPipelineRental(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_RENTALS, vars.parentId] });
    },
  });
}

export function useUpdatePipelineRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PipelineRental> }) => updatePipelineRental(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_RENTALS] });
    },
  });
}

export function useDeletePipelineRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePipelineRental(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_RENTALS] });
    },
  });
}

// --- Payments ---
export function usePipelinePayments(parentId: string, parentType: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PIPELINE_PAYMENTS, parentId, parentType],
    queryFn: () => fetchPipelinePayments(parentId, parentType),
    enabled: !!parentId,
  });
}

export function useCreatePipelinePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PipelinePayment>) => createPipelinePayment(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_PAYMENTS, vars.parentId] });
    },
  });
}

export function useUpdatePipelinePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PipelinePayment> }) => updatePipelinePayment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_PAYMENTS] });
    },
  });
}

export function useDeletePipelinePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePipelinePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_PAYMENTS] });
    },
  });
}

// --- Pipeline Operations ---
export function useCalculateTotals() {
  return useMutation({
    mutationFn: ({ parentId, parentType }: { parentId: string; parentType: string }) =>
      calculateTotals(parentId, parentType),
  });
}

export function useConvertLeadToOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data?: any }) =>
      convertLeadToOffer(leadId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OFFERS] });
    },
  });
}

export function useConvertOfferToSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: { userId: string; userName: string } }) =>
      convertOfferToSale(offerId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OFFERS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
    },
  });
}

export function useRevertLeadToOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => revertLeadToOffer(leadId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OFFERS] });
    },
  });
}
