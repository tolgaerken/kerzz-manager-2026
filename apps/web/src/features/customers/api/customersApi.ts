import { CUSTOMERS_CONSTANTS } from "../constants/customers.constants";
import type {
  CustomerQueryParams,
  CustomersResponse,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput
} from "../types";

const { API_BASE_URL, ENDPOINTS } = CUSTOMERS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

function buildQueryString(params: CustomerQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export async function fetchCustomers(
  params: CustomerQueryParams = {}
): Promise<CustomersResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<CustomersResponse>(response);
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  return handleResponse<Customer>(response);
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(input)
  });

  return handleResponse<Customer>(response);
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}/${id}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(input)
  });

  return handleResponse<Customer>(response);
}

export async function deleteCustomer(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Silme işlemi başarısız" }));
    throw new Error(error.message || "Silme işlemi başarısız");
  }
}
