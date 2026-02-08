import type { Country, CityTr, TownTr, DistrictTr } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

export async function fetchCountries(): Promise<Country[]> {
  const url = `${API_BASE_URL}/locations/countries`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return handleResponse<Country[]>(response);
}

export async function fetchCitiesTr(): Promise<CityTr[]> {
  const url = `${API_BASE_URL}/locations/cities-tr`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return handleResponse<CityTr[]>(response);
}

export async function fetchTownsTr(cityId: number): Promise<TownTr[]> {
  const url = `${API_BASE_URL}/locations/towns-tr?cityId=${cityId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return handleResponse<TownTr[]>(response);
}

export async function fetchDistrictsTr(
  cityId: number,
  townId?: number
): Promise<DistrictTr[]> {
  const params = new URLSearchParams({ cityId: cityId.toString() });
  if (townId !== undefined) {
    params.set("townId", townId.toString());
  }
  const url = `${API_BASE_URL}/locations/districts-tr?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return handleResponse<DistrictTr[]>(response);
}
