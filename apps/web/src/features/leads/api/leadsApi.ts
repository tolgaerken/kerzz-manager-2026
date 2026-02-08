import { LEADS_CONSTANTS } from "../constants/leads.constants";
import type {
  LeadsResponse,
  LeadQueryParams,
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  AddActivityInput,
  LeadStats,
} from "../types/lead.types";

const { API_BASE_URL, ENDPOINTS } = LEADS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Sunucu hatası",
    );
  }
  return response.json();
}

function buildQueryString(params: LeadQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined)
    searchParams.set("page", String(params.page));
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.priority && params.priority !== "all")
    searchParams.set("priority", params.priority);
  if (params.assignedUserId)
    searchParams.set("assignedUserId", params.assignedUserId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  return searchParams.toString();
}

export async function fetchLeads(
  params: LeadQueryParams = {},
): Promise<LeadsResponse> {
  const qs = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<LeadsResponse>(response);
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Lead>(response);
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Lead>(response);
}

export async function updateLead(
  id: string,
  input: UpdateLeadInput,
): Promise<Lead> {
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Lead>(response);
}

export async function deleteLead(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}/${encodeURIComponent(id)}`;

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

export async function addLeadActivity(
  id: string,
  input: AddActivityInput,
): Promise<Lead> {
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}/${encodeURIComponent(id)}/activities`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Lead>(response);
}

export async function fetchLeadStats(): Promise<LeadStats> {
  const url = `${API_BASE_URL}${ENDPOINTS.LEADS}/stats`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<LeadStats>(response);
}
