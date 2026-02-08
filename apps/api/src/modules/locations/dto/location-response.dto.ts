export interface CountryResponseDto {
  _id: string;
  id: number;
  name: string;
  nativeName: string;
  alpha2Code: string;
  alpha3Code: string;
  capital: string;
  callingCodes: string[];
  flag: string;
}

export interface CityTrResponseDto {
  _id: string;
  id: number;
  name: string;
}

export interface TownTrResponseDto {
  _id: string;
  id: number;
  cityId: number;
  code: number;
  name: string;
}

export interface DistrictTrResponseDto {
  _id: string;
  id: number;
  city_id: number;
  town: string;
  county: string;
  zipcode: string;
}
