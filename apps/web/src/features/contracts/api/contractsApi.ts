import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import { CONTRACTS_CONSTANTS } from "../constants/contracts.constants";
import type {
  ContractQueryParams,
  ContractsResponse,
  Contract,
  CreateContractInput,
  UpdateContractInput,
  CheckContractResult
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CONTRACTS_CONSTANTS;

function buildQueryString(params: ContractQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.flow && params.flow !== "all") searchParams.set("flow", params.flow);
  if (params.yearly !== undefined) searchParams.set("yearly", params.yearly.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.customerId) searchParams.set("customerId", params.customerId);

  return searchParams.toString();
}

export async function fetchContracts(params: ContractQueryParams = {}): Promise<ContractsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}${queryString ? `?${queryString}` : ""}`;
  return apiGet<ContractsResponse>(url);
}

export async function fetchContractById(id: string): Promise<Contract> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}/${encodeURIComponent(id)}`;
  return apiGet<Contract>(url);
}

export async function createContract(data: CreateContractInput): Promise<Contract> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}`;
  return apiPost<Contract>(url, data);
}

export async function updateContract(id: string, data: UpdateContractInput): Promise<Contract> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}/${encodeURIComponent(id)}`;
  const { id: _ignoredId, ...payload } = data;
  return apiPut<Contract>(url, payload);
}

export async function checkContract(contractId: string): Promise<CheckContractResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}/check/${encodeURIComponent(contractId)}`;
  return apiPost<CheckContractResult>(url);
}

export interface DeleteContractResult {
  deletedPaymentPlans: number;
}

export async function deleteContract(id: string): Promise<DeleteContractResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACTS}/${encodeURIComponent(id)}`;
  return apiDelete<DeleteContractResult>(url);
}
