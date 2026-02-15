import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInflationRate,
  deleteInflationRate,
  fetchInflationRates,
  updateInflationRate,
} from "../api";
import type {
  InflationRateFormData,
  InflationRateQueryParams,
  InflationRatesResponse,
} from "../types";

export const inflationRateKeys = {
  all: ["inflation-rates"] as const,
  lists: () => [...inflationRateKeys.all, "list"] as const,
  list: (params: InflationRateQueryParams) =>
    [...inflationRateKeys.lists(), params] as const,
};

export function useInflationRates(params: InflationRateQueryParams = {}) {
  return useQuery<InflationRatesResponse, Error>({
    queryKey: inflationRateKeys.list(params),
    queryFn: () => fetchInflationRates(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateInflationRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InflationRateFormData) => createInflationRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inflationRateKeys.lists() });
    },
  });
}

export function useUpdateInflationRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InflationRateFormData>;
    }) => updateInflationRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inflationRateKeys.lists() });
    },
  });
}

export function useDeleteInflationRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInflationRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inflationRateKeys.lists() });
    },
  });
}
