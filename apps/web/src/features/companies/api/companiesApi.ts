import { apiGet, apiPatch } from "../../../lib/apiClient";
import { COMPANIES_CONSTANTS } from "../constants/companies.constants";
import type { CompaniesQueryParams, GroupCompany, UpdateGroupCompanyInput } from "../types";

const { API_BASE_URL, ENDPOINTS } = COMPANIES_CONSTANTS;

export async function fetchCompanies(params?: CompaniesQueryParams): Promise<GroupCompany[]> {
  const includeInactive = params?.includeInactive ? "?includeInactive=true" : "";
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}${includeInactive}`;

  return apiGet<GroupCompany[]>(url);
}

export async function fetchCompanyById(id: string): Promise<GroupCompany> {
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}/${id}`;

  return apiGet<GroupCompany>(url);
}

export async function updateCompany(id: string, data: UpdateGroupCompanyInput): Promise<GroupCompany> {
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}/${id}`;

  return apiPatch<GroupCompany>(url, data);
}
