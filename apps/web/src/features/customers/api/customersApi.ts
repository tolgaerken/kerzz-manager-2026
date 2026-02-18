import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import { CUSTOMERS_CONSTANTS } from "../constants/customers.constants";
import type {
  CustomerQueryParams,
  CustomersResponse,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CUSTOMERS_CONSTANTS;

function buildQueryString(params: CustomerQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.activeContractsOnly) searchParams.set("activeContractsOnly", "true");

  return searchParams.toString();
}

export async function fetchCustomers(
  params: CustomerQueryParams = {}
): Promise<CustomersResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}${queryString ? `?${queryString}` : ""}`;
  return apiGet<CustomersResponse>(url);
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}/${id}`;
  return apiGet<Customer>(url);
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}`;
  return apiPost<Customer>(url, input);
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}/${id}`;
  return apiPut<Customer>(url, input);
}

export async function deleteCustomer(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}/${id}`;
  return apiDelete<void>(url);
}
