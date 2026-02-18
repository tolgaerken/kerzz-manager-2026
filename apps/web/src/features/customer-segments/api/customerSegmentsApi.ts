import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import { CUSTOMER_SEGMENTS_CONSTANTS } from "../constants/customer-segments.constants";
import type {
  CustomerSegmentQueryParams,
  CustomerSegmentsResponse,
  CustomerSegment,
  CreateCustomerSegmentInput,
  UpdateCustomerSegmentInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CUSTOMER_SEGMENTS_CONSTANTS;

function buildQueryString(params: CustomerSegmentQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchCustomerSegments(
  params: CustomerSegmentQueryParams = {}
): Promise<CustomerSegmentsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_SEGMENTS}${queryString ? `?${queryString}` : ""}`;
  return apiGet<CustomerSegmentsResponse>(url);
}

export async function fetchCustomerSegmentsMinimal(): Promise<CustomerSegment[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_SEGMENTS_MINIMAL}`;
  return apiGet<CustomerSegment[]>(url);
}

export async function fetchCustomerSegmentById(
  id: string
): Promise<CustomerSegment> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_SEGMENTS}/${id}`;
  return apiGet<CustomerSegment>(url);
}

export async function createCustomerSegment(
  input: CreateCustomerSegmentInput
): Promise<CustomerSegment> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_SEGMENTS}`;
  return apiPost<CustomerSegment>(url, input);
}

export async function updateCustomerSegment(
  id: string,
  input: UpdateCustomerSegmentInput
): Promise<CustomerSegment> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_SEGMENTS}/${id}`;
  return apiPut<CustomerSegment>(url, input);
}

export async function deleteCustomerSegment(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMER_SEGMENTS}/${id}`;
  return apiDelete<void>(url);
}
