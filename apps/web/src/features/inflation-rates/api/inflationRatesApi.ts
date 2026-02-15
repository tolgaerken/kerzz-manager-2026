import { apiDelete, apiGet, apiPatch, apiPost } from "../../../lib/apiClient";
import { INFLATION_RATES_CONSTANTS } from "../constants";
import type {
  InflationRateFormData,
  InflationRateItem,
  InflationRateQueryParams,
  InflationRatesResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = INFLATION_RATES_CONSTANTS;

function buildQueryString(params: InflationRateQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.country) searchParams.set("country", params.country);
  if (params.year !== undefined) searchParams.set("year", String(params.year));
  if (params.month !== undefined) searchParams.set("month", String(params.month));
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchInflationRates(
  params: InflationRateQueryParams = {},
): Promise<InflationRatesResponse> {
  const qs = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LIST}${qs ? `?${qs}` : ""}`;
  return apiGet<InflationRatesResponse>(url);
}

export async function createInflationRate(
  data: InflationRateFormData,
): Promise<InflationRateItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.CREATE}`;
  return apiPost<InflationRateItem>(url, data);
}

export async function updateInflationRate(
  id: string,
  data: Partial<InflationRateFormData>,
): Promise<InflationRateItem> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`;
  return apiPatch<InflationRateItem>(url, data);
}

export async function deleteInflationRate(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE(id)}`;
  return apiDelete<void>(url);
}
