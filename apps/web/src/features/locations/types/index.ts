export interface Country {
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

export interface CityTr {
  _id: string;
  id: number;
  name: string;
}

export interface TownTr {
  _id: string;
  id: number;
  cityId: number;
  code: number;
  name: string;
}

export interface DistrictTr {
  _id: string;
  id: number;
  city_id: number;
  town: string;
  county: string;
  zipcode: string;
}

export interface AddressData {
  address: string;
  cityId: number;
  city: string;
  townId: number;
  town: string;
  districtId: number;
  district: string;
  countryId: string;
  country: string;
}

export const EMPTY_ADDRESS: AddressData = {
  address: "",
  cityId: 0,
  city: "",
  townId: 0,
  town: "",
  districtId: 0,
  district: "",
  countryId: "TR",
  country: "Türkiye",
};
