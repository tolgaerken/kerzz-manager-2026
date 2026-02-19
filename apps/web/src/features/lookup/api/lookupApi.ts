import { apiGet } from "../../../lib/apiClient";
import type {
  CustomerLookupItem,
  LicenseLookupItem,
  LookupResponse
} from "../types/lookup.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

/**
 * Tüm müşterileri minimal alanlarla çeker.
 * Backend'e fields parametresi göndererek sadece gerekli alanları alır.
 */
export async function fetchCustomerLookup(): Promise<CustomerLookupItem[]> {
  const fields = "id,name,companyName,erpId,erpMappings,taxNo";
  const url = `${API_BASE_URL}/customers?limit=99999&type=all&fields=${fields}`;
  const result = await apiGet<LookupResponse<CustomerLookupItem>>(url);
  return result.data;
}

/**
 * Tüm lisansları minimal alanlarla çeker.
 * Backend'de zaten fields desteği var, sadece gerekli alanları ister.
 */
export async function fetchLicenseLookup(): Promise<LicenseLookupItem[]> {
  const fields = "id,brandName,SearchItem,customerId,customerName";
  const url = `${API_BASE_URL}/licenses?limit=99999&fields=${fields}`;
  const result = await apiGet<LookupResponse<LicenseLookupItem>>(url);
  return result.data;
}
