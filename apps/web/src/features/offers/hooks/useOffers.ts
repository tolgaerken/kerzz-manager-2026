import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OFFERS_CONSTANTS } from "../constants/offers.constants";
import {
  fetchOffers,
  fetchOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  updateOfferStatus,
  calculateOfferTotals,
  revertOfferConversion,
  fetchOfferStats,
} from "../api/offersApi";
import type {
  OfferQueryParams,
  OffersResponse,
  Offer,
  CreateOfferInput,
  UpdateOfferInput,
  OfferStatus,
  OfferStats,
} from "../types/offer.types";

const { QUERY_KEYS } = OFFERS_CONSTANTS;

export const offerKeys = {
  all: [QUERY_KEYS.OFFERS] as const,
  lists: () => [...offerKeys.all, "list"] as const,
  list: (params: OfferQueryParams) => [...offerKeys.lists(), params] as const,
  details: () => [...offerKeys.all, "detail"] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const,
  stats: () => [QUERY_KEYS.OFFER_STATS] as const,
};

export function useOffers(params: OfferQueryParams = {}) {
  return useQuery<OffersResponse, Error>({
    queryKey: offerKeys.list(params),
    queryFn: () => fetchOffers(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useOffer(id: string) {
  return useQuery<Offer, Error>({
    queryKey: offerKeys.detail(id),
    queryFn: () => fetchOfferById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useOfferStats() {
  return useQuery<OfferStats, Error>({
    queryKey: offerKeys.stats(),
    queryFn: () => fetchOfferStats(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOfferInput) => createOffer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.stats() });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOfferInput }) =>
      updateOffer(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: offerKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: offerKeys.stats() });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.stats() });
    },
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OfferStatus }) =>
      updateOfferStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: offerKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: offerKeys.stats() });
    },
  });
}

export function useCalculateOfferTotals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calculateOfferTotals(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
    },
  });
}

export function useRevertOfferConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revertOfferConversion(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.stats() });
    },
  });
}
