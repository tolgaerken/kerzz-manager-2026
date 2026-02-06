import { COMPANIES_CONSTANTS } from "../constants/companies.constants";
import type { GroupCompany } from "../types";

const { API_BASE_URL, ENDPOINTS } = COMPANIES_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

export async function fetchCompanies(): Promise<GroupCompany[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<GroupCompany[]>(response);
}

export async function fetchCompanyById(id: string): Promise<GroupCompany> {
  const url = `${API_BASE_URL}${ENDPOINTS.COMPANIES}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<GroupCompany>(response);
}
