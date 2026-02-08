export interface AddressDto {
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

export interface PersonDto {
  id: string;
  name: string;
  role: string;
  email: string;
  gsm: string;
}

export interface LicenseItemDto {
  id: string;
  moduleId: string;
  name: string;
  qty: number;
  subItems?: any[];
}

export interface OrwiStoreDto {
  id: string;
  name: string;
  cloudId: string;
}

export interface LicenseResponseDto {
  _id: string;
  id: string;
  no: number;
  creation: Date;
  customerId: string;
  customerName: string;
  brandName: string;
  address: AddressDto;
  phone: string;
  email: string;
  chainId: string;
  resellerId: string;
  persons: PersonDto[];
  person: string;
  block: boolean;
  blockMessage: string;
  isOpen: boolean;
  active: boolean;
  saasItems: LicenseItemDto[];
  licenseItems: LicenseItemDto[];
  licenseId: number;
  lastOnline: Date;
  lastIp: string;
  lastVersion: string;
  assetCode: number;
  hasRenty: boolean;
  hasLicense: boolean;
  haveContract: boolean;
  hasBoss: boolean;
  hasEftPos: boolean | null;
  type: string;
  currentVersion: string;
  orwiStore: OrwiStoreDto;
  SearchItem: string;
  companyType: string;
  kitchenType: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedLicensesResponseDto {
  data: (LicenseResponseDto | Record<string, unknown>)[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts?: LicenseCountsDto;
}

export interface LicenseCountsDto {
  total: number;
  active: number;
  blocked: number;
  withContract: number;
  byType: {
    kerzzPos: number;
    orwiPos: number;
    kerzzCloud: number;
  };
  byCompanyType: {
    chain: number;
    single: number;
    belediye: number;
    unv: number;
  };
}
