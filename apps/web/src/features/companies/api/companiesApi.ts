import { apiGet } from "../../../lib/apiClient";
import { COMPANIES_CONSTANTS } from "../constants/companies.constants";
import type { GroupCompany } from "../types";

const { API_BASE_URL, ENDPOINTS } = COMPANIES_CONSTANTS;

export async function fetchCompanies(): Promise<GroupCompany[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}`;

  return apiGet<GroupCompany[]>(url);
}

export async function fetchCompanyById(id: string): Promise<GroupCompany> {
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}/${id}`;

  return apiGet<GroupCompany>(url);
}
