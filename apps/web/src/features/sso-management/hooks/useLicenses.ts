import { useQuery } from "@tanstack/react-query";
import { licensesApi } from "../api/ssoApi";
import type { TLicense, LicenseSearchParams } from "../types";

const QUERY_KEY = "sso-licenses";

export function useLicenses(params?: LicenseSearchParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => licensesApi.list(params)
  });
}

export function useSearchLicenses(query: string, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEY, "search", query, limit],
    queryFn: () => licensesApi.search(query, limit),
    enabled: query.length >= 2
  });
}

export function useLicense(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => licensesApi.getById(id!),
    enabled: !!id
  });
}
