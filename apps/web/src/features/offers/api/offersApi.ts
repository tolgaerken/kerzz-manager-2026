import { OFFERS_CONSTANTS } from "../constants/offers.constants";
import type {
  Offer,
  OffersResponse,
  OfferQueryParams,
  CreateOfferInput,
  UpdateOfferInput,
  OfferStatus,
} from "../types/offer.types";

const { API_BASE_URL, ENDPOINTS } = OFFERS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Sunucu Hatası",
    );
  }
  return response.json();
}

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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<OffersResponse>(response);
}

export async function fetchOfferById(id: string): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_BY_ID(id)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Offer>(response);
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFERS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Offer>(response);
}

export async function updateOffer(
  id: string,
  input: UpdateOfferInput,
): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_BY_ID(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<Offer>(response);
}

export async function deleteOffer(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_BY_ID(id)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response
      .json()
      .catch(() => ({ message: "Silme hatası" }));
    throw new Error(
      (error as { message?: string }).message || "Silme hatası",
    );
  }
}

export async function updateOfferStatus(
  id: string,
  status: OfferStatus,
): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_STATUS(id)}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse<Offer>(response);
}

export async function calculateOfferTotals(id: string): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_CALCULATE(id)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Offer>(response);
}

export async function revertOfferConversion(id: string): Promise<Offer> {
  const url = `${API_BASE_URL}${ENDPOINTS.OFFER_REVERT_CONVERSION(id)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return handleResponse<Offer>(response);
}
