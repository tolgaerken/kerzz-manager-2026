// EftPos Models API

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<EftPosModelsResponse>(response);
}

// Tek EftPos modeli getir
export async function fetchEftPosModelById(id: string): Promise<EftPosModel> {
  const url = `${API_BASE_URL}/eft-pos-models/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<EftPosModel>(response);
}
