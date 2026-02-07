import { E_DOC_MEMBERS_CONSTANTS } from "../constants/eDocMembers.constants";
import type {
  EDocMembersResponse,
  EDocMemberQueryParams,
  EDocMemberFormData,
  EDocMemberItem,
} from "../types/eDocMember.types";

const { API_BASE_URL, ENDPOINTS } = E_DOC_MEMBERS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Sunucu Hatası",
    );
  }
  return response.json();
}

function buildQueryString(params: EDocMemberQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.erpId) searchParams.set("erpId", params.erpId);
  if (params.internalFirm) searchParams.set("internalFirm", params.internalFirm);
  if (params.contractType) searchParams.set("contractType", params.contractType);
  if (params.active) searchParams.set("active", params.active);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchEDocMembers(
  params: EDocMemberQueryParams = {},
): Promise<EDocMembersResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LIST}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<EDocMembersResponse>(response);
}

export async function createEDocMember(
  data: EDocMemberFormData,
): Promise<EDocMemberItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<EDocMemberItem>(response);
}

export async function updateEDocMember(
  id: string,
  data: Partial<EDocMemberFormData>,
): Promise<EDocMemberItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<EDocMemberItem>(response);
}

export async function deleteEDocMember(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE(id)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response
      .json()
      .catch(() => ({ message: "Silme hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Silme hatası",
    );
  }
}
