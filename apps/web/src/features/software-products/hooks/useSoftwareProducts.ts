import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSoftwareProducts,
  fetchSoftwareProductById,
  createSoftwareProduct,
  updateSoftwareProduct,
  deleteSoftwareProduct
} from "../api/softwareProductsApi";
import type {
  SoftwareProductQueryParams,
  SoftwareProductsResponse,
  SoftwareProduct,
  CreateSoftwareProductInput,
  UpdateSoftwareProductInput
} from "../types";

// Query keys
export const softwareProductsKeys = {
  all: ["software-products"] as const,
  lists: () => [...softwareProductsKeys.all, "list"] as const,
  list: (params: SoftwareProductQueryParams) => [...softwareProductsKeys.lists(), params] as const,
  details: () => [...softwareProductsKeys.all, "detail"] as const,
  detail: (id: string) => [...softwareProductsKeys.details(), id] as const
};

// Yazılım ürünlerini getir
export function useSoftwareProducts(params: SoftwareProductQueryParams = {}) {
  return useQuery<SoftwareProductsResponse, Error>({
    queryKey: softwareProductsKeys.list(params),
    queryFn: () => fetchSoftwareProducts(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });
}

// Tek yazılım ürünü getir
export function useSoftwareProduct(id: string | null) {
  return useQuery<SoftwareProduct, Error>({
    queryKey: softwareProductsKeys.detail(id || ""),
    queryFn: () => fetchSoftwareProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
}

// Yazılım ürünü oluştur
export function useCreateSoftwareProduct() {
  const queryClient = useQueryClient();

  return useMutation<SoftwareProduct, Error, CreateSoftwareProductInput>({
    mutationFn: createSoftwareProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: softwareProductsKeys.lists() });
    }
  });
}

// Yazılım ürünü güncelle
export function useUpdateSoftwareProduct() {
  const queryClient = useQueryClient();

  return useMutation<SoftwareProduct, Error, { id: string; data: UpdateSoftwareProductInput }>({
    mutationFn: ({ id, data }) => updateSoftwareProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: softwareProductsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: softwareProductsKeys.detail(variables.id) });
    }
  });
}

// Yazılım ürünü sil
export function useDeleteSoftwareProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteSoftwareProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: softwareProductsKeys.lists() });
    }
  });
}
