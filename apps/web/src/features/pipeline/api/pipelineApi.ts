import { PIPELINE_CONSTANTS } from "../constants/pipeline.constants";
import type {
  PipelineProduct,
  PipelineLicense,
  PipelineRental,
  PipelinePayment,
  PipelineTotals,
} from "../types/pipeline.types";

const { API_BASE_URL, ENDPOINTS } = PIPELINE_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

// --- Pipeline Products ---
export async function fetchPipelineProducts(parentId: string, parentType: string): Promise<PipelineProduct[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}?parentId=${parentId}&parentType=${parentType}`;
  const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return handleResponse<PipelineProduct[]>(response);
}

export async function createPipelineProduct(data: Partial<PipelineProduct>): Promise<PipelineProduct> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelineProduct>(response);
}

export async function updatePipelineProduct(id: string, data: Partial<PipelineProduct>): Promise<PipelineProduct> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelineProduct>(response);
}

export async function deletePipelineProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Silme işlemi başarısız");
}

// --- Pipeline Licenses ---
export async function fetchPipelineLicenses(parentId: string, parentType: string): Promise<PipelineLicense[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}?parentId=${parentId}&parentType=${parentType}`;
  const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return handleResponse<PipelineLicense[]>(response);
}

export async function createPipelineLicense(data: Partial<PipelineLicense>): Promise<PipelineLicense> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelineLicense>(response);
}

export async function updatePipelineLicense(id: string, data: Partial<PipelineLicense>): Promise<PipelineLicense> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelineLicense>(response);
}

export async function deletePipelineLicense(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Silme işlemi başarısız");
}

// --- Pipeline Rentals ---
export async function fetchPipelineRentals(parentId: string, parentType: string): Promise<PipelineRental[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}?parentId=${parentId}&parentType=${parentType}`;
  const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return handleResponse<PipelineRental[]>(response);
}

export async function createPipelineRental(data: Partial<PipelineRental>): Promise<PipelineRental> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelineRental>(response);
}

export async function updatePipelineRental(id: string, data: Partial<PipelineRental>): Promise<PipelineRental> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelineRental>(response);
}

export async function deletePipelineRental(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Silme işlemi başarısız");
}

// --- Pipeline Payments ---
export async function fetchPipelinePayments(parentId: string, parentType: string): Promise<PipelinePayment[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}?parentId=${parentId}&parentType=${parentType}`;
  const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return handleResponse<PipelinePayment[]>(response);
}

export async function createPipelinePayment(data: Partial<PipelinePayment>): Promise<PipelinePayment> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelinePayment>(response);
}

export async function updatePipelinePayment(id: string, data: Partial<PipelinePayment>): Promise<PipelinePayment> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PipelinePayment>(response);
}

export async function deletePipelinePayment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Silme işlemi başarısız");
}

// --- Pipeline Operations ---
export async function calculateTotals(parentId: string, parentType: string): Promise<PipelineTotals> {
  const endpoint = parentType === "offer" ? ENDPOINTS.OFFERS : ENDPOINTS.SALES;
  const response = await fetch(`${API_BASE_URL}${endpoint}/${parentId}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<PipelineTotals>(response);
}

export async function fetchPipelineHistory(ref: string) {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/${ref}/history`, {
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<any>(response);
}

export async function convertLeadToOffer(leadId: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/convert/lead-to-offer/${leadId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });
  return handleResponse<any>(response);
}

export async function convertOfferToSale(offerId: string, data: { userId: string; userName: string }) {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/convert/offer-to-sale/${offerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<any>(response);
}

export async function revertLeadToOffer(leadId: string) {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/revert/lead-to-offer/${leadId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<any>(response);
}
