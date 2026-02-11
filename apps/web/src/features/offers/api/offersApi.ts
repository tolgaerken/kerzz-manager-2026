import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { AUTH_CONSTANTS } from "../../auth/constants/auth.constants";
import { OFFERS_CONSTANTS } from "../constants/offers.constants";
import type {
  Offer,
  OffersResponse,
  OfferQueryParams,
  CreateOfferInput,
  UpdateOfferInput,
  OfferStatus,
  OfferStats,
} from "../types/offer.types";

const { API_BASE_URL, ENDPOINTS } = OFFERS_CONSTANTS;

function buildQueryString(params: OfferQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.sellerId) searchParams.set("sellerId", params.sellerId);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  return searchParams.toString();
}

export async function fetchOffers(
  params: OfferQueryParams = {},
): Promise<OffersResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.OFFERS}${queryString ? `?${queryString}` : ""}`;

  return apiGet<OffersResponse>(url);
}

export async function fetchOfferById(id: string): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_BY_ID(id)}`;

  return apiGet<Offer>(url);
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFERS}`;

  return apiPost<Offer>(url, input);
}

export async function updateOffer(
  id: string,
  input: UpdateOfferInput,
): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_BY_ID(id)}`;

  return apiPatch<Offer>(url, input);
}

export async function deleteOffer(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_BY_ID(id)}`;

  return apiDelete<void>(url);
}

export async function updateOfferStatus(
  id: string,
  status: OfferStatus,
): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_STATUS(id)}`;

  return apiPatch<Offer>(url, { status });
}

export async function calculateOfferTotals(id: string): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_CALCULATE(id)}`;

  return apiPost<Offer>(url, {});
}

export async function revertOfferConversion(id: string): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_REVERT_CONVERSION(id)}`;

  return apiPost<Offer>(url, {});
}

export async function fetchOfferStats(): Promise<OfferStats> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFERS}/stats`;

  return apiGet<OfferStats>(url);
}

/**
 * Teklif belgesini auth header ile fetch edip yeni sekmede açar.
 * window.open() JWT token gönderemediği için fetch + blob URL kullanılır.
 */
export async function openOfferDocument(
  id: string,
  format: "html" | "pdf" = "html",
): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_DOCUMENT(id, format)}`;

  // Auth header'ları al (apiClient pattern'i ile aynı)
  const headers: Record<string, string> = {};
  try {
    const storedData = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_INFO);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const token = parsed?.token;
      if (token?.accessToken) {
        headers["Authorization"] = `Bearer ${token.accessToken}`;
      }
    }
  } catch {
    // ignore
  }

  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Belge oluşturma hatası" }));
    throw new Error((error as { message?: string }).message || "Belge oluşturma hatası");
  }

  const contentType = format === "pdf" ? "application/pdf" : "text/html";
  const blob = new Blob([await response.arrayBuffer()], { type: contentType });
  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, "_blank");

  // Bellek temizliği: tab açıldıktan sonra blob URL'yi serbest bırak
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}
