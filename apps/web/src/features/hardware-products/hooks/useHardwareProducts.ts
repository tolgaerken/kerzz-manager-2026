import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHardwareProducts,
  fetchHardwareProductById,
  createHardwareProduct,
  updateHardwareProduct,
  deleteHardwareProduct
} from "../api/hardwareProductsApi";
import type {
  HardwareProductQueryParams,
  HardwareProductsResponse,
  HardwareProduct,
  CreateHardwareProductInput,
  UpdateHardwareProductInput
} from "../types";

// Query keys
export const hardwareProductsKeys = {
  all: ["hardware-products"] as const,
  lists: () => [...hardwareProductsKeys.all, "list"] as const,
  list: (params: HardwareProductQueryParams) => [...hardwareProductsKeys.lists(), params] as const,
  details: () => [...hardwareProductsKeys.all, "detail"] as const,
  detail: (id: string) => [...hardwareProductsKeys.details(), id] as const
};

// Donanım ürünlerini getir
export function useHardwareProducts(params: HardwareProductQueryParams = {}) {
  return useQuery<HardwareProductsResponse, Error>({
    queryKey: hardwareProductsKeys.list(params),
    queryFn: () => fetchHardwareProducts(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });
}

// Tek donanım ürünü getir
export function useHardwareProduct(id: string | null) {
  return useQuery<HardwareProduct, Error>({
    queryKey: hardwareProductsKeys.detail(id || ""),
    queryFn: () => fetchHardwareProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
}

// Donanım ürünü oluştur
export function useCreateHardwareProduct() {
  const queryClient = useQueryClient();

  return useMutation<HardwareProduct, Error, CreateHardwareProductInput>({
    mutationFn: createHardwareProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareProductsKeys.lists() });
    }
  });
}

// Donanım ürünü güncelle
export function useUpdateHardwareProduct() {
  const queryClient = useQueryClient();

  return useMutation<HardwareProduct, Error, { id: string; data: UpdateHardwareProductInput }>({
    mutationFn: ({ id, data }) => updateHardwareProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hardwareProductsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hardwareProductsKeys.detail(variables.id) });
    }
  });
}

// Donanım ürünü sil
export function useDeleteHardwareProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteHardwareProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareProductsKeys.lists() });
    }
  });
}
