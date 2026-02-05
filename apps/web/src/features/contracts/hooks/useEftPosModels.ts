import { useQuery } from "@tanstack/react-query";
import {
  fetchEftPosModels,
  type EftPosModelsResponse,
  type EftPosModelQueryParams
} from "../api/eftPosModelsApi";

// Query keys
export const eftPosModelsKeys = {
  all: ["eftPosModels"] as const,
  lists: () => [...eftPosModelsKeys.all, "list"] as const,
  list: (params: EftPosModelQueryParams) => [...eftPosModelsKeys.lists(), params] as const
};

// EftPos modellerini getir
export function useEftPosModels(params: EftPosModelQueryParams = {}) {
  return useQuery<EftPosModelsResponse, Error>({
    queryKey: eftPosModelsKeys.list(params),
    queryFn: () => fetchEftPosModels(params),
    staleTime: 1000 * 60 * 30, // 30 dakika - nadiren değişen veri
    gcTime: 1000 * 60 * 60 // 1 saat
  });
}

// Sadece aktif modelleri getir (combobox için)
export function useActiveEftPosModels() {
  return useEftPosModels({ active: true, sortField: "sortOrder", sortOrder: "asc" });
}
