// EftPos Models API

import { apiGet } from "../../../lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export interface EftPosModel {
  _id: string;
  id: string;
  name: string;
  brand: string;
  active: boolean;
  sortOrder: number;
  editDate?: string;
  editUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EftPosModelsResponse {
  data: EftPosModel[];
  total: number;
}

export interface EftPosModelQueryParams {
  search?: string;
  brand?: string;
  active?: boolean;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

function buildQueryString(params: EftPosModelQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.active !== undefined) searchParams.set("active", params.active.toString());
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

// EftPos modellerini getir
export async function fetchEftPosModels(
  params: EftPosModelQueryParams = {}
): Promise<EftPosModelsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}/eft-pos-models${queryString ? `?${queryString}` : ""}`;

  return apiGet<EftPosModelsResponse>(url);
}

// Tek EftPos modeli getir
export async function fetchEftPosModelById(id: string): Promise<EftPosModel> {
  const url = `${API_BASE_URL}/eft-pos-models/${id}`;

  return apiGet<EftPosModel>(url);
}
