import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLicenses,
  fetchLicenseById,
  createLicense,
  updateLicense,
  deleteLicense
} from "../api/licensesApi";
import type {
  LicenseQueryParams,
  LicensesResponse,
  License,
  CreateLicenseInput,
  UpdateLicenseInput
} from "../types";

// Query keys
export const licensesKeys = {
  all: ["licenses"] as const,
  lists: () => [...licensesKeys.all, "list"] as const,
  list: (params: LicenseQueryParams) => [...licensesKeys.lists(), params] as const,
  details: () => [...licensesKeys.all, "detail"] as const,
  detail: (id: string) => [...licensesKeys.details(), id] as const
};

// Lisansları getir
export function useLicenses(params: LicenseQueryParams = {}) {
  return useQuery<LicensesResponse, Error>({
    queryKey: licensesKeys.list(params),
    queryFn: () => fetchLicenses(params),
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 30 // 30 dakika
  });
}

// Tek lisans getir
export function useLicense(id: string | null) {
  return useQuery<License, Error>({
    queryKey: licensesKeys.detail(id || ""),
    queryFn: () => fetchLicenseById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
}

// Lisans oluştur
export function useCreateLicense() {
  const queryClient = useQueryClient();

  return useMutation<License, Error, CreateLicenseInput>({
    mutationFn: createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: licensesKeys.lists() });
    }
  });
}

// Lisans güncelle
export function useUpdateLicense() {
  const queryClient = useQueryClient();

  return useMutation<License, Error, { id: string; data: UpdateLicenseInput }>({
    mutationFn: ({ id, data }) => updateLicense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: licensesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: licensesKeys.detail(variables.id) });
    }
  });
}

// Lisans sil
export function useDeleteLicense() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: licensesKeys.lists() });
    }
  });
}
