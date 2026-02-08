import type {
  CustomerLookupItem,
  LicenseLookupItem,
  LookupResponse
} from "../types/lookup.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

/**
 * Tüm müşterileri minimal alanlarla çeker.
 * Backend'e fields parametresi göndererek sadece gerekli alanları alır.
 */
export async function fetchCustomerLookup(): Promise<CustomerLookupItem[]> {
  const fields = "id,name,companyName,erpId,taxNo";
  const url = `${API_BASE_URL}/customers?limit=99999&type=all&fields=${fields}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  const result = await handleResponse<LookupResponse<CustomerLookupItem>>(response);
  return result.data;
}

/**
 * Tüm lisansları minimal alanlarla çeker.
 * Backend'de zaten fields desteği var, sadece gerekli alanları ister.
 */
export async function fetchLicenseLookup(): Promise<LicenseLookupItem[]> {
  const fields = "id,brandName,SearchItem,customerId,customerName";
  const url = `${API_BASE_URL}/licenses?limit=99999&fields=${fields}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });

  const result = await handleResponse<LookupResponse<LicenseLookupItem>>(response);
  return result.data;
}
