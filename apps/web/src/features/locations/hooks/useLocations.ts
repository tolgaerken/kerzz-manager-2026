import { useQuery } from "@tanstack/react-query";
import {
  fetchCountries,
  fetchCitiesTr,
  fetchTownsTr,
  fetchDistrictsTr,
} from "../api/locationsApi";

const locationKeys = {
  all: ["locations"] as const,
  countries: () => [...locationKeys.all, "countries"] as const,
  citiesTr: () => [...locationKeys.all, "cities-tr"] as const,
  townsTr: (cityId: number) => [...locationKeys.all, "towns-tr", cityId] as const,
  districtsTr: (cityId: number, townId?: number) =>
    [...locationKeys.all, "districts-tr", cityId, townId] as const,
};

export function useCountries() {
  return useQuery({
    queryKey: locationKeys.countries(),
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60, // 1 saat
    gcTime: 1000 * 60 * 60 * 24, // 24 saat
  });
}

export function useCitiesTr() {
  return useQuery({
    queryKey: locationKeys.citiesTr(),
    queryFn: fetchCitiesTr,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useTownsTr(cityId: number) {
  return useQuery({
    queryKey: locationKeys.townsTr(cityId),
    queryFn: () => fetchTownsTr(cityId),
    enabled: cityId > 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useDistrictsTr(cityId: number, townId?: number) {
  return useQuery({
    queryKey: locationKeys.districtsTr(cityId, townId),
    queryFn: () => fetchDistrictsTr(cityId, townId),
    enabled: cityId > 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
