import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { PIPELINE_CONSTANTS } from "../constants/pipeline.constants";
import type {
  PipelineProduct,
  PipelineLicense,
  PipelineRental,
  PipelinePayment,
  PipelineTotals,
} from "../types/pipeline.types";

const { API_BASE_URL, ENDPOINTS } = PIPELINE_CONSTANTS;

// --- Pipeline Products ---
export async function fetchPipelineProducts(parentId: string, parentType: string): Promise<PipelineProduct[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}?parentId=${parentId}&parentType=${parentType}`;
  return apiGet<PipelineProduct[]>(url);
}

export async function createPipelineProduct(data: Partial<PipelineProduct>): Promise<PipelineProduct> {
  return apiPost<PipelineProduct>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}`, data);
}

export async function updatePipelineProduct(id: string, data: Partial<PipelineProduct>): Promise<PipelineProduct> {
  return apiPatch<PipelineProduct>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}/${id}`, data);
}

export async function deletePipelineProduct(id: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PRODUCTS}/${id}`);
}

// --- Pipeline Licenses ---
export async function fetchPipelineLicenses(parentId: string, parentType: string): Promise<PipelineLicense[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}?parentId=${parentId}&parentType=${parentType}`;
  return apiGet<PipelineLicense[]>(url);
}

export async function createPipelineLicense(data: Partial<PipelineLicense>): Promise<PipelineLicense> {
  return apiPost<PipelineLicense>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}`, data);
}

export async function updatePipelineLicense(id: string, data: Partial<PipelineLicense>): Promise<PipelineLicense> {
  return apiPatch<PipelineLicense>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}/${id}`, data);
}

export async function deletePipelineLicense(id: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_LICENSES}/${id}`);
}

// --- Pipeline Rentals ---
export async function fetchPipelineRentals(parentId: string, parentType: string): Promise<PipelineRental[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}?parentId=${parentId}&parentType=${parentType}`;
  return apiGet<PipelineRental[]>(url);
}

export async function createPipelineRental(data: Partial<PipelineRental>): Promise<PipelineRental> {
  return apiPost<PipelineRental>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}`, data);
}

export async function updatePipelineRental(id: string, data: Partial<PipelineRental>): Promise<PipelineRental> {
  return apiPatch<PipelineRental>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}/${id}`, data);
}

export async function deletePipelineRental(id: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_RENTALS}/${id}`);
}

// --- Pipeline Payments ---
export async function fetchPipelinePayments(parentId: string, parentType: string): Promise<PipelinePayment[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}?parentId=${parentId}&parentType=${parentType}`;
  return apiGet<PipelinePayment[]>(url);
}

export async function createPipelinePayment(data: Partial<PipelinePayment>): Promise<PipelinePayment> {
  return apiPost<PipelinePayment>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}`, data);
}

export async function updatePipelinePayment(id: string, data: Partial<PipelinePayment>): Promise<PipelinePayment> {
  return apiPatch<PipelinePayment>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}/${id}`, data);
}

export async function deletePipelinePayment(id: string): Promise<void> {
  return apiDelete<void>(`${API_BASE_URL}${ENDPOINTS.PIPELINE_PAYMENTS}/${id}`);
}

// --- Pipeline Operations ---
export async function calculateTotals(parentId: string, parentType: string): Promise<PipelineTotals> {
  const endpoint = parentType === "offer" ? ENDPOINTS.OFFERS : ENDPOINTS.SALES;
  return apiPost<PipelineTotals>(`${API_BASE_URL}${endpoint}/${parentId}/calculate`, {});
}

export async function fetchPipelineHistory(ref: string) {
  return apiGet<any>(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/${ref}/history`);
}

export async function convertLeadToOffer(leadId: string, data?: any) {
  return apiPost<any>(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/convert/lead-to-offer/${leadId}`, data || {});
}

export async function convertOfferToSale(offerId: string, data: { userId: string; userName: string }) {
  return apiPost<any>(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/convert/offer-to-sale/${offerId}`, data);
}

export async function revertLeadToOffer(leadId: string) {
  return apiPost<any>(`${API_BASE_URL}${ENDPOINTS.PIPELINE}/revert/lead-to-offer/${leadId}`, {});
}
