import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { CONTRACTS_CONSTANTS } from "../constants/contracts.constants";
import type {
  ContractUser,
  ContractSupport,
  ContractSaas,
  ContractCashRegister,
  ContractVersion,
  ContractItem,
  ContractDocument,
  ContractPayment,
  ContractDetailListResponse,
  CashRegisterStatsDto,
  SaasStatsDto
} from "../types";
import type { SupportsStats } from "../components/SupportsDashboard/useSupportsStats";

const { API_BASE_URL, ENDPOINTS } = CONTRACTS_CONSTANTS;

// Contract Users API
export async function fetchContractUsers(
  contractId: string
): Promise<ContractDetailListResponse<ContractUser>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}?contractId=${encodeURIComponent(contractId)}`;
  return apiGet(url);
}

export async function createContractUser(
  data: Omit<ContractUser, "_id" | "id">
): Promise<ContractUser> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}`, data);
}

export async function updateContractUser(
  id: string,
  data: Partial<Omit<ContractUser, "_id" | "id">>
): Promise<ContractUser> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractUser(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}/${encodeURIComponent(id)}`);
}

// Contract Supports API
export async function fetchContractSupports(
  contractId?: string
): Promise<ContractDetailListResponse<ContractSupport>> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}${params}`;
  return apiGet(url);
}

export async function createContractSupport(
  data: Omit<ContractSupport, "_id" | "id">
): Promise<ContractSupport> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}`, data);
}

export async function updateContractSupport(
  id: string,
  data: Partial<Omit<ContractSupport, "_id" | "id">>
): Promise<ContractSupport> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractSupport(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}/${encodeURIComponent(id)}`);
}

export async function fetchContractSupportStats(
  contractId?: string
): Promise<SupportsStats> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}/stats${params}`;
  return apiGet(url);
}

// Contract Saas API
export async function fetchContractSaas(
  contractId?: string
): Promise<ContractDetailListResponse<ContractSaas>> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}${params}`;
  return apiGet(url);
}

export async function createContractSaas(
  data: Omit<ContractSaas, "_id" | "id">
): Promise<ContractSaas> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}`, data);
}

export async function updateContractSaas(
  id: string,
  data: Partial<Omit<ContractSaas, "_id" | "id">>
): Promise<ContractSaas> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractSaas(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}/${encodeURIComponent(id)}`);
}

export async function fetchContractSaasStats(
  contractId?: string
): Promise<SaasStatsDto> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}/stats${params}`;
  return apiGet(url);
}

// Contract Cash Registers API
export async function fetchContractCashRegisters(
  contractId?: string
): Promise<ContractDetailListResponse<ContractCashRegister>> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}${params}`;
  return apiGet(url);
}

export async function createContractCashRegister(
  data: Omit<ContractCashRegister, "_id" | "id">
): Promise<ContractCashRegister> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}`, data);
}

export async function updateContractCashRegister(
  id: string,
  data: Partial<Omit<ContractCashRegister, "_id" | "id">>
): Promise<ContractCashRegister> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractCashRegister(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}/${encodeURIComponent(id)}`);
}

export async function fetchContractCashRegisterStats(
  contractId?: string
): Promise<CashRegisterStatsDto> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}/stats${params}`;
  return apiGet(url);
}

// Contract Versions API
export async function fetchContractVersions(
  contractId?: string
): Promise<ContractDetailListResponse<ContractVersion>> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}${params}`;
  return apiGet(url);
}

export async function createContractVersion(
  data: Omit<ContractVersion, "_id" | "id">
): Promise<ContractVersion> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}`, data);
}

export async function updateContractVersion(
  id: string,
  data: Partial<Omit<ContractVersion, "_id" | "id">>
): Promise<ContractVersion> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractVersion(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}/${encodeURIComponent(id)}`);
}

// Contract Items API
export async function fetchContractItems(
  contractId: string
): Promise<ContractDetailListResponse<ContractItem>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}?contractId=${encodeURIComponent(contractId)}`;
  return apiGet(url);
}

export async function createContractItem(
  data: Omit<ContractItem, "_id" | "id">
): Promise<ContractItem> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}`, data);
}

export async function updateContractItem(
  id: string,
  data: Partial<Omit<ContractItem, "_id" | "id">>
): Promise<ContractItem> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractItem(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}/${encodeURIComponent(id)}`);
}

// Contract Documents API
export async function fetchContractDocuments(
  contractId?: string
): Promise<ContractDetailListResponse<ContractDocument>> {
  const params = contractId ? `?contractId=${encodeURIComponent(contractId)}` : "";
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}${params}`;
  return apiGet(url);
}

export async function createContractDocument(
  data: Omit<ContractDocument, "_id" | "id">
): Promise<ContractDocument> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}`, data);
}

export async function updateContractDocument(
  id: string,
  data: Partial<Omit<ContractDocument, "_id" | "id">>
): Promise<ContractDocument> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractDocument(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}/${encodeURIComponent(id)}`);
}

// Contract Payments API
export async function fetchContractPayments(
  contractId: string
): Promise<ContractDetailListResponse<ContractPayment>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}?contractId=${encodeURIComponent(contractId)}`;
  return apiGet(url);
}

export async function createContractPayment(
  data: Omit<ContractPayment, "_id" | "id">
): Promise<ContractPayment> {
  return apiPost(`${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}`, data);
}

export async function updateContractPayment(
  id: string,
  data: Partial<Omit<ContractPayment, "_id" | "id">>
): Promise<ContractPayment> {
  return apiPatch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}/${encodeURIComponent(id)}`, data);
}

export async function deleteContractPayment(id: string): Promise<void> {
  return apiDelete(`${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}/${encodeURIComponent(id)}`);
}
