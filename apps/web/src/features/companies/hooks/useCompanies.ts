import { useQuery } from "@tanstack/react-query";
import { fetchCompanies, fetchCompanyById } from "../api/companiesApi";
import { COMPANIES_CONSTANTS } from "../constants/companies.constants";

const { QUERY_KEYS } = COMPANIES_CONSTANTS;

export function useCompanies() {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANIES],
    queryFn: () => fetchCompanies(),
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
