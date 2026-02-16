import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCompanies, fetchCompanyById, updateCompany } from "../api/companiesApi";
import { COMPANIES_CONSTANTS } from "../constants/companies.constants";
import type { CompaniesQueryParams, UpdateGroupCompanyInput } from "../types";

const { QUERY_KEYS } = COMPANIES_CONSTANTS;

export function useCompanies(params?: CompaniesQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANIES, params],
    queryFn: () => fetchCompanies(params),
    staleTime: 5 * 60 * 1000, // 5 dakika - nadiren değişen veri
  });
}

export function useCompany(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANY, id],
    queryFn: () => fetchCompanyById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupCompanyInput }) =>
      updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANIES] });
    },
  });
}
