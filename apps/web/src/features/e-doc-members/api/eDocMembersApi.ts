import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { E_DOC_MEMBERS_CONSTANTS } from "../constants/eDocMembers.constants";
import type {
  EDocMembersResponse,
  EDocMemberQueryParams,
  EDocMemberFormData,
  EDocMemberItem,
} from "../types/eDocMember.types";

const { API_BASE_URL, ENDPOINTS } = E_DOC_MEMBERS_CONSTANTS;

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

  return apiGet<EDocMembersResponse>(url);
}

export async function createEDocMember(
  data: EDocMemberFormData,
): Promise<EDocMemberItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;

  return apiPost<EDocMemberItem>(url, data);
}

export async function updateEDocMember(
  id: string,
  data: Partial<EDocMemberFormData>,
): Promise<EDocMemberItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;

  return apiPatch<EDocMemberItem>(url, data);
}

export async function deleteEDocMember(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE(id)}`;

  return apiDelete<void>(url);
}
