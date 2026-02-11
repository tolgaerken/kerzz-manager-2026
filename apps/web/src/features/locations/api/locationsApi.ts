import { apiGet } from "../../../lib/apiClient";
import type { Country, CityTr, TownTr, DistrictTr } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export async function fetchCountries(): Promise<Country[]> {
  const url = `${API_BASE_URL}/locations/countries`;
  return apiGet<Country[]>(url);
}

export async function fetchCitiesTr(): Promise<CityTr[]> {
  const url = `${API_BASE_URL}/locations/cities-tr`;
  return apiGet<CityTr[]>(url);
}

export async function fetchTownsTr(cityId: number): Promise<TownTr[]> {
  const url = `${API_BASE_URL}/locations/towns-tr?cityId=${cityId}`;
  return apiGet<TownTr[]>(url);
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
  return apiGet<DistrictTr[]>(url);
}
