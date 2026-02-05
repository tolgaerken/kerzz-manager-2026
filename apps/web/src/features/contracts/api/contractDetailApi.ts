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
  ContractDetailListResponse
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CONTRACTS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

// Contract Users API
export async function fetchContractUsers(
  contractId: string
): Promise<ContractDetailListResponse<ContractUser>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractUser(
  data: Omit<ContractUser, "_id" | "id">
): Promise<ContractUser> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractUser(
  id: string,
  data: Partial<Omit<ContractUser, "_id" | "id">>
): Promise<ContractUser> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_USERS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Supports API
export async function fetchContractSupports(
  contractId: string
): Promise<ContractDetailListResponse<ContractSupport>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractSupport(
  data: Omit<ContractSupport, "_id" | "id">
): Promise<ContractSupport> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractSupport(
  id: string,
  data: Partial<Omit<ContractSupport, "_id" | "id">>
): Promise<ContractSupport> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractSupport(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SUPPORTS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Saas API
export async function fetchContractSaas(
  contractId: string
): Promise<ContractDetailListResponse<ContractSaas>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractSaas(
  data: Omit<ContractSaas, "_id" | "id">
): Promise<ContractSaas> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractSaas(
  id: string,
  data: Partial<Omit<ContractSaas, "_id" | "id">>
): Promise<ContractSaas> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractSaas(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_SAAS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Cash Registers API
export async function fetchContractCashRegisters(
  contractId: string
): Promise<ContractDetailListResponse<ContractCashRegister>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractCashRegister(
  data: Omit<ContractCashRegister, "_id" | "id">
): Promise<ContractCashRegister> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractCashRegister(
  id: string,
  data: Partial<Omit<ContractCashRegister, "_id" | "id">>
): Promise<ContractCashRegister> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractCashRegister(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_CASH_REGISTERS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Versions API
export async function fetchContractVersions(
  contractId: string
): Promise<ContractDetailListResponse<ContractVersion>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractVersion(
  data: Omit<ContractVersion, "_id" | "id">
): Promise<ContractVersion> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractVersion(
  id: string,
  data: Partial<Omit<ContractVersion, "_id" | "id">>
): Promise<ContractVersion> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractVersion(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_VERSIONS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Items API
export async function fetchContractItems(
  contractId: string
): Promise<ContractDetailListResponse<ContractItem>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractItem(
  data: Omit<ContractItem, "_id" | "id">
): Promise<ContractItem> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractItem(
  id: string,
  data: Partial<Omit<ContractItem, "_id" | "id">>
): Promise<ContractItem> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_ITEMS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Documents API
export async function fetchContractDocuments(
  contractId: string
): Promise<ContractDetailListResponse<ContractDocument>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractDocument(
  data: Omit<ContractDocument, "_id" | "id">
): Promise<ContractDocument> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractDocument(
  id: string,
  data: Partial<Omit<ContractDocument, "_id" | "id">>
): Promise<ContractDocument> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractDocument(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_DOCUMENTS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}

// Contract Payments API
export async function fetchContractPayments(
  contractId: string
): Promise<ContractDetailListResponse<ContractPayment>> {
  const url = `${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}?contractId=${encodeURIComponent(contractId)}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function createContractPayment(
  data: Omit<ContractPayment, "_id" | "id">
): Promise<ContractPayment> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateContractPayment(
  id: string,
  data: Partial<Omit<ContractPayment, "_id" | "id">>
): Promise<ContractPayment> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteContractPayment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONTRACT_PAYMENTS}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}
