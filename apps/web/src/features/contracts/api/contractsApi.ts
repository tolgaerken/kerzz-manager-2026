import { CONTRACTS_CONSTANTS } from "../constants/contracts.constants";
import type { ContractQueryParams, ContractsResponse, Contract } from "../types";

const { API_BASE_URL, ENDPOINTS } = CONTRACTS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: ContractQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.flow && params.flow !== "all") searchParams.set("flow", params.flow);
  if (params.yearly !== undefined) searchParams.set("yearly", params.yearly.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchContracts(params: ContractQueryParams = {}): Promise<ContractsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<ContractsResponse>(response);
}

export async function fetchContractById(id: string): Promise<Contract> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<Contract>(response);
}
